#!/usr/bin/env python3
"""
Reddit Lead Finder for Baisics
Finds relevant posts in fitness subreddits for manual outreach.

Setup:
1. pip install praw
2. Create Reddit app at https://www.reddit.com/prefs/apps
   - Choose "script" type
   - Redirect URI can be http://localhost:8080
3. Set environment variables (or create .env file):
   - REDDIT_CLIENT_ID
   - REDDIT_CLIENT_SECRET
   - REDDIT_USER_AGENT (e.g., "baisics-lead-finder/1.0")

Usage:
  python scripts/reddit_lead_finder.py
  python scripts/reddit_lead_finder.py --days 3
  python scripts/reddit_lead_finder.py --output leads.csv
"""

import praw
import os
import argparse
from datetime import datetime, timedelta
import csv

# === CONFIG ===

SUBREDDITS = [
    "beginnerfitness",
    "fitness",
    "GYM",
    "homegym",
    "workout",
    "gainit",
    "loseit",
    "bodyweightfitness",
    "StartingStrength",
    "Stronglifts5x5",
]

KEYWORDS = [
    "workout app",
    "fitness app",
    "gym app",
    "training app",
    "program app",
    "app recommendation",
    "app suggestions",
    "looking for app",
    "need an app",
    "best app",
    "free app",
    "beginner program",
    "workout program",
    "where to start",
    "just starting",
    "new to gym",
    "new to fitness",
    "getting started",
    "help me start",
    "workout plan",
    "training plan",
    "custom program",
    "personalized workout",
]

# === SCRIPT ===

def get_reddit_client():
    """Initialize Reddit client from environment variables."""
    client_id = os.environ.get("REDDIT_CLIENT_ID")
    client_secret = os.environ.get("REDDIT_CLIENT_SECRET")
    user_agent = os.environ.get("REDDIT_USER_AGENT", "baisics-lead-finder/1.0")

    if not client_id or not client_secret:
        print("ERROR: Missing Reddit API credentials")
        print("")
        print("Set these environment variables:")
        print("  export REDDIT_CLIENT_ID='your_client_id'")
        print("  export REDDIT_CLIENT_SECRET='your_client_secret'")
        print("")
        print("Get credentials at: https://www.reddit.com/prefs/apps")
        print("  1. Click 'create another app'")
        print("  2. Choose 'script' type")
        print("  3. Set redirect URI to http://localhost:8080")
        exit(1)

    return praw.Reddit(
        client_id=client_id,
        client_secret=client_secret,
        user_agent=user_agent,
    )


def search_subreddit(reddit, subreddit_name, keywords, days_back):
    """Search a subreddit for posts matching keywords."""
    leads = []
    cutoff = datetime.utcnow() - timedelta(days=days_back)

    try:
        subreddit = reddit.subreddit(subreddit_name)

        for keyword in keywords:
            try:
                for post in subreddit.search(keyword, sort="new", time_filter="month", limit=25):
                    post_time = datetime.utcfromtimestamp(post.created_utc)

                    if post_time < cutoff:
                        continue

                    lead = {
                        "subreddit": subreddit_name,
                        "title": post.title,
                        "author": str(post.author) if post.author else "[deleted]",
                        "url": f"https://reddit.com{post.permalink}",
                        "score": post.score,
                        "comments": post.num_comments,
                        "created": post_time.strftime("%Y-%m-%d %H:%M"),
                        "keyword": keyword,
                    }

                    # Dedupe by URL
                    if not any(l["url"] == lead["url"] for l in leads):
                        leads.append(lead)

            except Exception as e:
                print(f"  Warning: Error searching '{keyword}': {e}")

    except Exception as e:
        print(f"  Error accessing r/{subreddit_name}: {e}")

    return leads


def main():
    parser = argparse.ArgumentParser(description="Find Reddit leads for Baisics outreach")
    parser.add_argument("--days", type=int, default=7, help="Look back N days (default: 7)")
    parser.add_argument("--output", type=str, default=None, help="Output CSV file (default: print to console)")
    args = parser.parse_args()

    print(f"Reddit Lead Finder for Baisics")
    print(f"=" * 40)
    print(f"Looking back: {args.days} days")
    print(f"Subreddits: {len(SUBREDDITS)}")
    print(f"Keywords: {len(KEYWORDS)}")
    print("")

    reddit = get_reddit_client()
    all_leads = []

    for subreddit_name in SUBREDDITS:
        print(f"Searching r/{subreddit_name}...")
        leads = search_subreddit(reddit, subreddit_name, KEYWORDS, args.days)
        all_leads.extend(leads)
        print(f"  Found {len(leads)} posts")

    # Sort by score descending
    all_leads.sort(key=lambda x: x["score"], reverse=True)

    print("")
    print(f"=" * 40)
    print(f"Total leads found: {len(all_leads)}")
    print("")

    if args.output:
        # Write to CSV
        with open(args.output, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["subreddit", "title", "author", "url", "score", "comments", "created", "keyword"])
            writer.writeheader()
            writer.writerows(all_leads)
        print(f"Saved to: {args.output}")
    else:
        # Print to console
        for i, lead in enumerate(all_leads[:30], 1):  # Top 30
            print(f"{i}. [{lead['subreddit']}] {lead['title'][:60]}")
            print(f"   Score: {lead['score']} | Comments: {lead['comments']} | Author: u/{lead['author']}")
            print(f"   {lead['url']}")
            print("")

        if len(all_leads) > 30:
            print(f"... and {len(all_leads) - 30} more. Use --output leads.csv to export all.")


if __name__ == "__main__":
    main()
