import json
import sys
from datetime import datetime, timedelta
import re
from typing import Dict, List, Optional, Any, Union

# Simple in-memory calendar database for demonstration
calendar_events = []

class CalendarEvent:
    def __init__(
        self,
        title: str,
        start_time: datetime,
        end_time: datetime,
        attendees: List[str] = None,
        location: str = None,
        description: str = None,
        id: str = None
    ):
        self.id = id or f"event_{len(calendar_events) + 1}"
        self.title = title
        self.start_time = start_time
        self.end_time = end_time
        self.attendees = attendees or []
        self.location = location
        self.description = description

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "start_time": self.start_time.isoformat(),
            "end_time": self.end_time.isoformat(),
            "attendees": self.attendees,
            "location": self.location,
            "description": self.description
        }

def parse_datetime(datetime_str: str) -> datetime:
    """Parse a datetime string into a datetime object."""
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
    current_time = datetime.now()
    # Default to 2025 instead of current year
    default_year = 2025
    today = datetime(default_year, current_time.month, current_time.day).replace(hour=0, minute=0, second=0, microsecond=0)
    
    if "today" in datetime_str.lower():
        base_date = today
    elif "tomorrow" in datetime_str.lower():
        base_date = today + timedelta(days=1)
    else:
        # Default to today in 2025 if no specific date is given
        base_date = today
    
    # Extract time if provided
    time_match = re.search(r'(\d{1,2}):(\d{2})(?:\s*(am|pm))?', datetime_str, re.IGNORECASE)
    if time_match:
        hour = int(time_match.group(1))
        minute = int(time_match.group(2))
        am_pm = time_match.group(3)
        
        if am_pm and am_pm.lower() == 'pm' and hour < 12:
            hour += 12
        elif am_pm and am_pm.lower() == 'am' and hour == 12:
            hour = 0
            
        return base_date.replace(hour=hour, minute=minute)
    
    # If no time is provided, default to 9 AM for start times
    return base_date.replace(hour=9, minute=0)

def create_event(args: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new calendar event."""
    title = args.get("title", "Untitled Event")
    
    try:
        # Default to current date in 2025 if no start_time provided
        if not args.get("start_time", ""):
            current_date = datetime.now()
            default_date = datetime(2025, current_date.month, current_date.day, 9, 0)
            args["start_time"] = default_date.strftime("%Y-%m-%d %H:%M")
            
        start_time = parse_datetime(args.get("start_time", ""))
        
        # If end_time is provided, parse it, otherwise default to 1 hour after start_time
        if "end_time" in args and args["end_time"]:
            end_time = parse_datetime(args["end_time"])
        else:
            end_time = start_time + timedelta(hours=1)
            
        attendees = args.get("attendees", [])
        if isinstance(attendees, str):
            attendees = [att.strip() for att in attendees.split(",")]
        
        event = CalendarEvent(
            title=title,
            start_time=start_time,
            end_time=end_time,
            attendees=attendees,
            location=args.get("location"),
            description=args.get("description")
        )
        
        calendar_events.append(event)
        return {"status": "success", "event": event.to_dict()}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_events(args: Dict[str, Any]) -> Dict[str, Any]:
    """Get calendar events, optionally filtered by date range."""
    try:
        start_date_str = args.get("start_date")
        end_date_str = args.get("end_date")
        
        # If no date filters provided, default to showing events in 2025
        if not start_date_str and not end_date_str:
            current_date = datetime.now()
            start_date = datetime(2025, 1, 1)
            end_date = datetime(2025, 12, 31, 23, 59, 59)
            filtered_events = [e for e in calendar_events 
                              if e.start_time >= start_date and e.start_time <= end_date]
        else:
            filtered_events = calendar_events
            
            if start_date_str:
                start_date = parse_datetime(start_date_str)
                filtered_events = [e for e in filtered_events if e.start_time >= start_date]
                
            if end_date_str:
                end_date = parse_datetime(end_date_str)
                filtered_events = [e for e in filtered_events if e.start_time <= end_date]
            
        return {
            "status": "success", 
            "events": [event.to_dict() for event in filtered_events]
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

def update_event(args: Dict[str, Any]) -> Dict[str, Any]:
    """Update an existing calendar event."""
    try:
        event_id = args.get("id")
        if not event_id:
            return {"status": "error", "message": "Event ID is required"}
            
        event = next((e for e in calendar_events if e.id == event_id), None)
        if not event:
            return {"status": "error", "message": f"Event with ID {event_id} not found"}
            
        if "title" in args:
            event.title = args["title"]
            
        if "start_time" in args:
            event.start_time = parse_datetime(args["start_time"])
            
        if "end_time" in args:
            event.end_time = parse_datetime(args["end_time"])
            
        if "attendees" in args:
            attendees = args["attendees"]
            if isinstance(attendees, str):
                attendees = [att.strip() for att in attendees.split(",")]
            event.attendees = attendees
            
        if "location" in args:
            event.location = args["location"]
            
        if "description" in args:
            event.description = args["description"]
            
        return {"status": "success", "event": event.to_dict()}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def delete_event(args: Dict[str, Any]) -> Dict[str, Any]:
    """Delete a calendar event."""
    try:
        event_id = args.get("id")
        if not event_id:
            return {"status": "error", "message": "Event ID is required"}
            
        event_index = next((i for i, e in enumerate(calendar_events) if e.id == event_id), None)
        if event_index is None:
            return {"status": "error", "message": f"Event with ID {event_id} not found"}
            
        deleted_event = calendar_events.pop(event_index)
        return {"status": "success", "deleted_event": deleted_event.to_dict()}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def find_available_slots(args: Dict[str, Any]) -> Dict[str, Any]:
    """Find available time slots based on existing calendar events."""
    try:
        current_date = datetime.now()
        default_date = datetime(2025, current_date.month, current_date.day)
        date_str = args.get("date", default_date.strftime("%Y-%m-%d"))
        duration_minutes = int(args.get("duration_minutes", 30))
        
        date = parse_datetime(date_str)
        day_start = date.replace(hour=9, minute=0, second=0, microsecond=0)
        day_end = date.replace(hour=17, minute=0, second=0, microsecond=0)
        
        # Get all events for the specified day
        day_events = [
            e for e in calendar_events 
            if e.start_time.date() == date.date()
        ]
        
        # Sort events by start time
        day_events.sort(key=lambda e: e.start_time)
        
        # Find available slots
        available_slots = []
        current_time = day_start
        
        for event in day_events:
            if current_time < event.start_time:
                time_diff = (event.start_time - current_time).total_seconds() / 60
                if time_diff >= duration_minutes:
                    available_slots.append({
                        "start_time": current_time.isoformat(),
                        "end_time": (current_time + timedelta(minutes=duration_minutes)).isoformat()
                    })
            current_time = max(current_time, event.end_time)
            
        # Check for available slot after the last event
        if current_time < day_end:
            time_diff = (day_end - current_time).total_seconds() / 60
            if time_diff >= duration_minutes:
                available_slots.append({
                    "start_time": current_time.isoformat(),
                    "end_time": (current_time + timedelta(minutes=duration_minutes)).isoformat()
                })
                
        return {"status": "success", "available_slots": available_slots}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Function dispatch table
FUNCTIONS = {
    "create_event": create_event,
    "get_events": get_events,
    "update_event": update_event,
    "delete_event": delete_event,
    "find_available_slots": find_available_slots,
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