import json
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
import uuid

# Simple in-memory task database for demonstration
tasks = []

class Task:
    def __init__(
        self,
        title: str,
        description: str = None,
        due_date: datetime = None,
        priority: str = "medium",
        completed: bool = False,
        assignee: str = None,
        tags: List[str] = None,
        created_at: datetime = None,
        id: str = None
    ):
        self.id = id or str(uuid.uuid4())
        self.title = title
        self.description = description
        self.due_date = due_date
        self.priority = priority
        self.completed = completed
        self.assignee = assignee
        self.tags = tags or []
        self.created_at = created_at or datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "priority": self.priority,
            "completed": self.completed,
            "assignee": self.assignee,
            "tags": self.tags,
            "created_at": self.created_at.isoformat()
        }

def parse_datetime(datetime_str: str) -> Optional[datetime]:
    """Parse a datetime string into a datetime object."""
    if not datetime_str:
        return None
        
    formats = [
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%Y-%m-%d",
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(datetime_str, fmt)
        except ValueError:
            continue
    
    # Natural language parsing
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    if "today" in datetime_str.lower():
        return today
    elif "tomorrow" in datetime_str.lower():
        return today + timedelta(days=1)
    elif "next week" in datetime_str.lower():
        return today + timedelta(days=7)
    
    return None

def create_task(args: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new task."""
    try:
        title = args.get("title")
        if not title:
            return {"status": "error", "message": "Task title is required"}
            
        due_date_str = args.get("due_date")
        due_date = parse_datetime(due_date_str) if due_date_str else None
        
        tags = args.get("tags", [])
        if isinstance(tags, str):
            tags = [tag.strip() for tag in tags.split(",")]
            
        task = Task(
            title=title,
            description=args.get("description"),
            due_date=due_date,
            priority=args.get("priority", "medium"),
            completed=args.get("completed", False),
            assignee=args.get("assignee"),
            tags=tags
        )
        
        tasks.append(task)
        return {"status": "success", "task": task.to_dict()}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_tasks(args: Dict[str, Any]) -> Dict[str, Any]:
    """Get tasks, optionally filtered by criteria."""
    try:
        # Apply filters if provided
        filtered_tasks = tasks
        
        # Filter by completion status
        if "completed" in args:
            completed = args["completed"]
            if isinstance(completed, str):
                completed = completed.lower() == "true"
            filtered_tasks = [t for t in filtered_tasks if t.completed == completed]
            
        # Filter by priority
        if "priority" in args:
            priority = args["priority"]
            filtered_tasks = [t for t in filtered_tasks if t.priority == priority]
            
        # Filter by assignee
        if "assignee" in args:
            assignee = args["assignee"]
            filtered_tasks = [t for t in filtered_tasks if t.assignee == assignee]
            
        # Filter by tag
        if "tag" in args:
            tag = args["tag"]
            filtered_tasks = [t for t in filtered_tasks if tag in t.tags]
            
        # Filter by due date range
        if "due_date_before" in args:
            due_date = parse_datetime(args["due_date_before"])
            if due_date:
                filtered_tasks = [t for t in filtered_tasks if t.due_date and t.due_date <= due_date]
                
        if "due_date_after" in args:
            due_date = parse_datetime(args["due_date_after"])
            if due_date:
                filtered_tasks = [t for t in filtered_tasks if t.due_date and t.due_date >= due_date]
                
        # Sort results
        sort_by = args.get("sort_by", "created_at")
        sort_dir = args.get("sort_dir", "desc").lower()
        
        if sort_by == "due_date":
            # Handle None values in due_date
            if sort_dir == "asc":
                filtered_tasks.sort(key=lambda t: (t.due_date is None, t.due_date))
            else:
                filtered_tasks.sort(key=lambda t: (t.due_date is None, t.due_date), reverse=True)
        elif sort_by == "priority":
            priority_order = {"high": 0, "medium": 1, "low": 2}
            if sort_dir == "asc":
                filtered_tasks.sort(key=lambda t: priority_order.get(t.priority, 3))
            else:
                filtered_tasks.sort(key=lambda t: priority_order.get(t.priority, 3), reverse=True)
        elif sort_by == "created_at":
            if sort_dir == "asc":
                filtered_tasks.sort(key=lambda t: t.created_at)
            else:
                filtered_tasks.sort(key=lambda t: t.created_at, reverse=True)
                
        return {
            "status": "success",
            "tasks": [task.to_dict() for task in filtered_tasks]
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

def update_task(args: Dict[str, Any]) -> Dict[str, Any]:
    """Update an existing task."""
    try:
        task_id = args.get("id")
        if not task_id:
            return {"status": "error", "message": "Task ID is required"}
            
        task = next((t for t in tasks if t.id == task_id), None)
        if not task:
            return {"status": "error", "message": f"Task with ID {task_id} not found"}
            
        if "title" in args:
            task.title = args["title"]
            
        if "description" in args:
            task.description = args["description"]
            
        if "due_date" in args:
            task.due_date = parse_datetime(args["due_date"])
            
        if "priority" in args:
            task.priority = args["priority"]
            
        if "completed" in args:
            completed = args["completed"]
            if isinstance(completed, str):
                completed = completed.lower() == "true"
            task.completed = completed
            
        if "assignee" in args:
            task.assignee = args["assignee"]
            
        if "tags" in args:
            tags = args["tags"]
            if isinstance(tags, str):
                tags = [tag.strip() for tag in tags.split(",")]
            task.tags = tags
            
        return {"status": "success", "task": task.to_dict()}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def delete_task(args: Dict[str, Any]) -> Dict[str, Any]:
    """Delete a task."""
    try:
        task_id = args.get("id")
        if not task_id:
            return {"status": "error", "message": "Task ID is required"}
            
        task_index = next((i for i, t in enumerate(tasks) if t.id == task_id), None)
        if task_index is None:
            return {"status": "error", "message": f"Task with ID {task_id} not found"}
            
        deleted_task = tasks.pop(task_index)
        return {"status": "success", "deleted_task": deleted_task.to_dict()}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def mark_completed(args: Dict[str, Any]) -> Dict[str, Any]:
    """Mark a task as completed."""
    try:
        task_id = args.get("id")
        if not task_id:
            return {"status": "error", "message": "Task ID is required"}
            
        task = next((t for t in tasks if t.id == task_id), None)
        if not task:
            return {"status": "error", "message": f"Task with ID {task_id} not found"}
            
        task.completed = True
        return {"status": "success", "task": task.to_dict()}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_task_summary(args: Dict[str, Any]) -> Dict[str, Any]:
    """Get a summary of tasks by status, priority, etc."""
    try:
        total_tasks = len(tasks)
        completed_tasks = sum(1 for t in tasks if t.completed)
        incomplete_tasks = total_tasks - completed_tasks
        
        # Count by priority
        priority_counts = {
            "high": sum(1 for t in tasks if t.priority == "high"),
            "medium": sum(1 for t in tasks if t.priority == "medium"),
            "low": sum(1 for t in tasks if t.priority == "low")
        }
        
        # Count by due date
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        overdue = sum(1 for t in tasks if not t.completed and t.due_date and t.due_date < today)
        due_today = sum(1 for t in tasks if not t.completed and t.due_date and t.due_date.date() == today.date())
        due_this_week = sum(
            1 for t in tasks 
            if not t.completed 
            and t.due_date 
            and t.due_date.date() > today.date() 
            and t.due_date.date() <= (today + timedelta(days=7)).date()
        )
        
        return {
            "status": "success",
            "summary": {
                "total_tasks": total_tasks,
                "completed_tasks": completed_tasks,
                "incomplete_tasks": incomplete_tasks,
                "completion_percentage": round(completed_tasks / total_tasks * 100, 1) if total_tasks > 0 else 0,
                "priority_counts": priority_counts,
                "overdue": overdue,
                "due_today": due_today,
                "due_this_week": due_this_week
            }
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Function dispatch table
FUNCTIONS = {
    "create_task": create_task,
    "get_tasks": get_tasks,
    "update_task": update_task,
    "delete_task": delete_task,
    "mark_completed": mark_completed,
    "get_task_summary": get_task_summary,
}

if __name__ == "__main__":
    for line in sys.stdin:
        try:
            request = json.loads(line)
            function_name = request.get("function")
            args = request.get("args", {})
            
            if function_name in FUNCTIONS:
                result = FUNCTIONS[function_name](args)
            else:
                result = {
                    "status": "error",
                    "message": f"Unknown function: {function_name}"
                }
                
            print(json.dumps(result))
            sys.stdout.flush()
        except json.JSONDecodeError:
            print(json.dumps({"status": "error", "message": "Invalid JSON"}))
            sys.stdout.flush()
        except Exception as e:
            print(json.dumps({"status": "error", "message": str(e)}))
            sys.stdout.flush() 