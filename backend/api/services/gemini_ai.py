import os
import json
import logging
import time
from google import genai
from google.api_core import exceptions

logger = logging.getLogger(__name__)

class GeminiAIService:
    def __init__(self):
        # Load multiple API keys from environment
        api_keys_str = os.getenv('GEMINI_API_KEYS', '')
        if not api_keys_str:
            raise ValueError("GEMINI_API_KEYS not found in environment variables")
        
        self.api_keys = [key.strip() for key in api_keys_str.split(',')]
        self.current_key_index = 0
        self.clients = [genai.Client(api_key=key) for key in self.api_keys]
        self.last_request_time = 0
        self.model = "gemini-flash-latest"  # Use gemini-2.0-flash-lite instead

    def _get_next_client(self):
        """Rotate to next API key"""
        self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
        return self.clients[self.current_key_index]
    
    def _rate_limit(self, min_delay=2.0):
        """Wait between requests to avoid rate limiting"""
        elapsed = time.time() - self.last_request_time
        if elapsed < min_delay:
            time.sleep(min_delay - elapsed)
        self.last_request_time = time.time()
    
    def _exponential_backoff(self, attempt, base_delay=1):
        """Exponential backoff for retries"""
        delay = base_delay * (2 ** attempt)
        time.sleep(delay)
    
    def _clean_json_response(self, response_text):
        """Helper to extract JSON from markdown formatting"""
        try:
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]
            return json.loads(response_text.strip())
        except Exception as e:
            logger.error(f"JSON parsing error: {e}, raw response: {response_text}")
            return {}

    def generate_weekly_summary(self, work_entries, blockers):
        """Generate AI-powered weekly summary"""
        entries_text = "\n".join([
            f"- {entry['title']}: {entry['hours_spent']}hrs ({entry['entry_type']})"
            + (f"\n  Learning: {entry['learning_notes']}" if entry.get('learning_notes') else "")
            for entry in work_entries
        ]) or "No work entries"
        
        blockers_text = "\n".join([
            f"- {blocker['title']}: Waiting on {blocker['waiting_on']}, {blocker['hours_lost']}hrs lost"
            for blocker in blockers
        ]) or "No blockers"
        
        prompt = f"""Analyze this intern's work week and create a summary for their manager.

WORK ENTRIES THIS WEEK:
{entries_text}

BLOCKERS ENCOUNTERED:
{blockers_text}

Return ONLY valid JSON (no markdown):
{{
    "accomplishments": ["achievement 1", "achievement 2"],
    "learnings": ["learning 1", "learning 2"],
    "blockers_impact": ["blocker with time impact"],
    "initiative": ["self-directed work"],
    "time_breakdown": {{"coding": 60, "meetings": 15, "blocked": 20, "learning": 5}},
    "narrative_summary": "2-3 sentence overview"
}}"""

        max_retries = 3
        for attempt in range(max_retries):
            try:
                self._rate_limit(2.0)
                client = self._get_next_client()
                response = client.models.generate_content(
                    model=self.model,
                    contents=prompt
                )
                logger.info(f"Weekly summary generated (Key #{self.current_key_index + 1})")
                return self._clean_json_response(response.text)
            except Exception as e:
                error_str = str(e)
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    logger.warning(f"Rate limited on attempt {attempt + 1}, backing off...")
                    if attempt < max_retries - 1:
                        self._exponential_backoff(attempt)
                        continue
                logger.error(f"Error generating summary: {error_str}", exc_info=True)
                break
        
        return {
            "accomplishments": [],
            "learnings": [],
            "blockers_impact": [],
            "initiative": [],
            "time_breakdown": {"coding": 0, "meetings": 0, "blocked": 0, "learning": 0},
            "narrative_summary": "Unable to generate summary at this time."
        }

    def generate_one_on_one_prep(self, work_entries, blockers, skills):
        """Generate 1-on-1 talking points"""
        entries_text = "\n".join([
            f"- {entry['title']}: {entry['hours_spent']}hrs"
            for entry in work_entries[:10]
        ]) or "No recent work"
        
        blockers_text = "\n".join([
            f"- {blocker['title']}: {blocker['waiting_on']}"
            for blocker in blockers if blocker.get('status') == 'active'
        ]) or "No active blockers"
        
        skills_text = ", ".join([
            skill.get('skill_name', skill.get('name', 'Unknown')) 
            for skill in skills[:10]
        ]) or "No skills yet"
        
        prompt = f"""Help this intern prepare for their 1-on-1 with their manager.

RECENT WORK:
{entries_text}

CURRENT BLOCKERS:
{blockers_text}

SKILLS DEVELOPING: {skills_text}

Return ONLY JSON (no markdown):
{{
    "wins": ["achievement 1"],
    "help_needed": ["blocker needing help"],
    "questions": ["smart question 1"],
    "growth_requests": ["skill to develop"]
}}"""

        max_retries = 3
        for attempt in range(max_retries):
            try:
                self._rate_limit(2.0)
                client = self._get_next_client()
                response = client.models.generate_content(
                    model=self.model,
                    contents=prompt
                )
                logger.info(f"1-on-1 prep generated (Key #{self.current_key_index + 1})")
                return self._clean_json_response(response.text)
            except Exception as e:
                error_str = str(e)
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    logger.warning(f"Rate limited on attempt {attempt + 1}, backing off...")
                    if attempt < max_retries - 1:
                        self._exponential_backoff(attempt)
                        continue
                logger.error(f"Error generating 1-on-1 prep: {error_str}", exc_info=True)
                break
        
        return {"wins": [], "help_needed": [], "questions": [], "growth_requests": []}

    def extract_skills(self, work_entries):
        """Extract skills from work entries"""
        entries_text = "\n".join([
            f"- {entry['title']}: {entry.get('description', '')}"
            + (f"\n  Notes: {entry['learning_notes']}" if entry.get('learning_notes') else "")
            for entry in work_entries
        ]) or "No work entries"
        
        prompt = f"""Extract technical skills from these work entries.

WORK ENTRIES:
{entries_text}

Return ONLY JSON (no markdown):
{{
    "skills": [
        {{"name": "React", "confidence": 4}},
        {{"name": "Python", "confidence": 3}}
    ]
}}"""

        max_retries = 3
        for attempt in range(max_retries):
            try:
                self._rate_limit(2.0)
                client = self._get_next_client()
                response = client.models.generate_content(
                    model=self.model,
                    contents=prompt
                )
                logger.info(f"Skills extracted (Key #{self.current_key_index + 1})")
                result = self._clean_json_response(response.text)
                if result.get("skills"):
                    return result
            except Exception as e:
                error_str = str(e)
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    logger.warning(f"Rate limited on attempt {attempt + 1}, backing off...")
                    if attempt < max_retries - 1:
                        self._exponential_backoff(attempt)
                        continue
                logger.error(f"Error extracting skills: {error_str}", exc_info=True)
                break
        
        return {"skills": []}