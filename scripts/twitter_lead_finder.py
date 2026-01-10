#!/usr/bin/env python3
"""
Twitter/X Lead Finder for Baisics
Finds relevant tweets for manual outreach.

Setup:
1. pip install tweepy
2. Get Twitter API credentials at https://developer.twitter.com/en/portal/projects-and-apps
   - Create a project and app
   - Get Bearer Token from "Keys and tokens" tab
3. Set environment variable:
   - TWITTER_BEARER_TOKEN

Note: Twitter free tier = 1500 tweets/month read limit. Use sparingly.

Usage:
  python scripts/twitter_lead_finder.py
  python scripts/twitter_lead_finder.py --output leads.csv
  python scripts/twitter_lead_finder.py --urls-only  # No API needed, just opens search URLs
"""

import os
import argparse
import csv
import webbrowser
from datetime import datetime, timedelta
from urllib.parse import quote_plus

# === CONFIG ===

SEARCH_QUERIES = [
    "looking for workout app",
    "need workout app",
    "best workout app",
    "gym app recommendation",
    "fitness app recommendation",
    "workout program help",
    "beginner gym help",
    "starting gym need help",
    "workout plan app",
    "free fitness app",
    '"workout app" -filter:links',  # People asking, not promoting
    '"gym app" beginner',
    '"fitness app" free',
    "need help workout routine",
    "custom workout program",
]

# === SCRIPT ===

def get_twitter_client():
    """Initialize Twitter client from environment variables."""
    try:
        import tweepy
    except ImportError:
        print("ERROR: tweepy not installed")
        print("Run: pip install tweepy")
        exit(1)

    bearer_token = os.environ.get("TWITTER_BEARER_TOKEN")

    if not bearer_token:
        print("ERROR: Missing Twitter API credentials")
        print("")
        print("Set this environment variable:")
        print("  export TWITTER_BEARER_TOKEN='your_bearer_token'")
        print("")
        print("Get credentials at: https://developer.twitter.com/en/portal/projects-and-apps")
        print("  1. Create a project and app (free tier works)")
        print("  2. Go to 'Keys and tokens' tab")
        print("  3. Generate Bearer Token")
        print("")
        print("Or use --urls-only mode to skip API and just open search URLs")
        exit(1)

    return tweepy.Client(bearer_token=bearer_token)


def search_twitter(client, query, max_results=20):
    """Search Twitter for recent tweets matching query."""
    leads = []

    try:
        # Search recent tweets (last 7 days max on free tier)
        tweets = client.search_recent_tweets(
            query=f"{query} -is:retweet lang:en",
            max_results=min(max_results, 100),
            tweet_fields=["created_at", "public_metrics", "author_id"],
            expansions=["author_id"],
            user_fields=["username"],
        )

        if not tweets.data:
            return leads

        # Build author lookup
        users = {u.id: u for u in (tweets.includes.get("users", []) or [])}

        for tweet in tweets.data:
            author = users.get(tweet.author_id)
            username = author.username if author else "unknown"
            metrics = tweet.public_metrics or {}

            lead = {
                "username": username,
                "text": tweet.text[:200].replace("\n", " "),
                "url": f"https://twitter.com/{username}/status/{tweet.id}",
                "likes": metrics.get("like_count", 0),
                "retweets": metrics.get("retweet_count", 0),
                "replies": metrics.get("reply_count", 0),
                "created": tweet.created_at.strftime("%Y-%m-%d %H:%M") if tweet.created_at else "",
                "query": query,
            }
            leads.append(lead)

    except Exception as e:
        print(f"  Error searching '{query}': {e}")

    return leads


def generate_search_urls():
    """Generate Twitter search URLs for manual browsing."""
    urls = []
    for query in SEARCH_QUERIES:
        encoded = quote_plus(query)
        url = f"https://twitter.com/search?q={encoded}&src=typed_query&f=live"
        urls.append({"query": query, "url": url})
    return urls


def main():
    parser = argparse.ArgumentParser(description="Find Twitter leads for Baisics outreach")
    parser.add_argument("--output", type=str, default=None, help="Output CSV file")
    parser.add_argument("--urls-only", action="store_true", help="Just print search URLs (no API needed)")
    parser.add_argument("--open", action="store_true", help="Open search URLs in browser (use with --urls-only)")
    args = parser.parse_args()

    print(f"Twitter Lead Finder for Baisics")
    print(f"=" * 40)

    if args.urls_only:
        print("Mode: URLs only (no API)")
        print("")
        urls = generate_search_urls()

        for i, item in enumerate(urls, 1):
            print(f"{i}. {item['query']}")
            print(f"   {item['url']}")
            print("")

            if args.open:
                webbrowser.open(item['url'])

        print(f"Total: {len(urls)} search URLs")
        if not args.open:
            print("")
            print("Tip: Use --open to open all URLs in browser")
        return

    print(f"Queries: {len(SEARCH_QUERIES)}")
    print("")

    client = get_twitter_client()
    all_leads = []

    for query in SEARCH_QUERIES:
        print(f"Searching: {query[:40]}...")
        leads = search_twitter(client, query, max_results=15)
        all_leads.extend(leads)
        print(f"  Found {len(leads)} tweets")

    # Dedupe by URL
    seen = set()
    unique_leads = []
    for lead in all_leads:
        if lead["url"] not in seen:
            seen.add(lead["url"])
            unique_leads.append(lead)

    # Sort by engagement
    unique_leads.sort(key=lambda x: x["likes"] + x["retweets"] * 2, reverse=True)

    print("")
    print(f"=" * 40)
    print(f"Total unique leads: {len(unique_leads)}")
    print("")

    if args.output:
        with open(args.output, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["username", "text", "url", "likes", "retweets", "replies", "created", "query"])
            writer.writeheader()
            writer.writerows(unique_leads)
        print(f"Saved to: {args.output}")
    else:
        for i, lead in enumerate(unique_leads[:20], 1):
            print(f"{i}. @{lead['username']}")
            print(f"   {lead['text'][:80]}...")
            print(f"   Likes: {lead['likes']} | RTs: {lead['retweets']} | {lead['url']}")
            print("")

        if len(unique_leads) > 20:
            print(f"... and {len(unique_leads) - 20} more. Use --output leads.csv to export all.")


if __name__ == "__main__":
    main()
