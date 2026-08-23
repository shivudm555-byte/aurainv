#!/usr/bin/env python3
"""
Supabase Email Authentication MCP Server
========================================
Exposes Model Context Protocol (MCP) tools for user authentication via Supabase:
- supabase_email_signup
- supabase_email_login
- supabase_send_magic_link_or_otp
- supabase_verify_email_otp
- supabase_reset_password_email
- supabase_get_user
- supabase_sync_user_to_db

Supports standard JSON-RPC 2.0 stdio transport for MCP clients.
"""

import sys
import json
import urllib.request
import urllib.error
import sqlite3
import os
import hashlib
import uuid
from typing import Dict, Any, Optional

# Supabase Configuration
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://hcvckfirqlggamffsrvc.supabase.co")
SUPABASE_ANON_KEY = os.environ.get(
    "SUPABASE_ANON_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdmNrZmlycWxnZ2FtZmZzcnZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNTcxNjYsImV4cCI6MjEwMjczMzE2Nn0.TR0wutoferxUXY6Uj-ZuOFhQmIbhq_yK_uHYpBmYc60"
)
SUPABASE_PUBLISHABLE_KEY = os.environ.get(
    "SUPABASE_PUBLISHABLE_KEY",
    "sb_publishable_qjL7djPcOPznZm-Nsu9Lgw_H0CUZ3cx"
)

# Local DB path for synchronization
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LOCAL_DB_PATH = os.path.join(SCRIPT_DIR, "fintech.db")


def hash_val(val: str) -> str:
    return hashlib.sha256(val.encode("utf-8")).hexdigest()


def get_local_db():
    conn = sqlite3.connect(LOCAL_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def supabase_http_request(endpoint: str, data: Optional[Dict[str, Any]] = None, method: str = "POST", auth_token: Optional[str] = None) -> Dict[str, Any]:
    """Execute REST request against Supabase Auth API."""
    url = f"{SUPABASE_URL}/auth/v1{endpoint}"
    headers = {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {auth_token if auth_token else SUPABASE_ANON_KEY}"
    }

    body = json.dumps(data).encode("utf-8") if data is not None and method != "GET" else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            return json.loads(res_body) if res_body else {}
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        try:
            err_json = json.loads(error_body)
            msg = err_json.get("msg") or err_json.get("message") or err_json.get("error_description") or err_json.get("error") or str(e)
        except Exception:
            msg = error_body or str(e)
        raise Exception(f"Supabase Auth Error ({e.code}): {msg}")
    except Exception as e:
        raise Exception(f"Network / Request Error: {str(e)}")


def sync_user_to_local_db(email: str, full_name: str = "", phone: str = "", supabase_uid: str = "", referral_code: str = "") -> Dict[str, Any]:
    """Sync authenticated Supabase user with the local fintech database and ledger."""
    email = email.strip().lower()
    if not full_name:
        full_name = email.split("@")[0].capitalize()
    
    # Generate unique deterministic phone if placeholder or empty
    if not phone or phone == "+91 98000 00000":
        phone_seed = int(hashlib.sha256(email.encode("utf-8")).hexdigest()[:8], 16) % 900000000 + 100000000
        phone = f"+91 9{phone_seed}"

    conn = get_local_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id, full_name, email, phone, role, status, kyc_status, is_2fa_enabled, referral_code FROM users WHERE LOWER(email) = ?", (email,))
    user = cursor.fetchone()

    if not user:
        new_referral_code = f"{full_name[:3].upper()}{uuid.uuid4().hex[:4].upper()}"
        pw_hash = hash_val(f"supabase_{supabase_uid or email}")
        pin_hash = hash_val("1234")

        # Check if phone is already used by another account, if so generate fresh unique suffix
        cursor.execute("SELECT id FROM users WHERE phone = ?", (phone,))
        if cursor.fetchone():
            phone = f"+91 9{uuid.uuid4().int % 900000000 + 100000000}"

        referrer = None
        if referral_code:
            cursor.execute("SELECT id FROM users WHERE referral_code = ?", (referral_code,))
            referrer = cursor.fetchone()

        cursor.execute("""
        INSERT INTO users (full_name, email, phone, password_hash, pin_hash, referral_code, referred_by, kyc_status, role, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'not_submitted', 'user', 'active')
        """, (full_name, email, phone, pw_hash, pin_hash, new_referral_code, referral_code if referrer else None))
        user_id = cursor.lastrowid

        cursor.execute("INSERT OR IGNORE INTO user_profiles (user_id, dob, address, city, country) VALUES (?, '', '', '', 'India')", (user_id,))
        cursor.execute("INSERT OR IGNORE INTO wallets (user_id, cash_balance, invested_balance, accrued_balance) VALUES (?, 0.0, 0.0, 0.0)", (user_id,))
        cursor.execute("""
        INSERT INTO notifications (user_id, title, message, category)
        VALUES (?, 'Welcome to Antigravity Fintech', 'Your account has been authenticated via Supabase Email Auth. Complete your KYC to unlock full investment capabilities.', 'system')
        """, (user_id,))

        cursor.execute("SELECT id, full_name, email, phone, role, status, kyc_status, is_2fa_enabled, referral_code FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
    else:
        cursor.execute("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", (user["id"],))

    conn.commit()
    user_dict = dict(user)
    conn.close()

    return {
        "success": True,
        "message": "User synchronized with local financial database",
        "user": user_dict,
        "session_token": f"sb-session-{uuid.uuid4().hex}"
    }


# ============================================================================
# Tool Implementations
# ============================================================================

def tool_supabase_email_signup(email: str, password: str, full_name: str = "", phone: str = "", referral_code: str = "") -> Dict[str, Any]:
    """Register a new user in Supabase with email and password."""
    email = email.strip().lower()
    if not email or not password:
        return {"success": False, "error": "Email and password are required"}

    signup_payload = {
        "email": email,
        "password": password,
        "data": {
            "full_name": full_name or email.split("@")[0].capitalize(),
            "phone": phone or "+91 98000 00000",
            "referral_code": referral_code
        }
    }

    try:
        res = supabase_http_request("/signup", data=signup_payload, method="POST")
        sb_user = res.get("user") or res
        sb_uid = sb_user.get("id", "")
        session = res.get("session")

        # Sync with local database
        sync_result = sync_user_to_local_db(
            email=email,
            full_name=full_name,
            phone=phone,
            supabase_uid=sb_uid,
            referral_code=referral_code
        )

        return {
            "success": True,
            "message": "User successfully registered via Supabase Auth",
            "supabase_user_id": sb_uid,
            "email": email,
            "session": session,
            "local_user": sync_result["user"],
            "requires_email_confirmation": session is None
        }
    except Exception as e:
        err_msg = str(e)
        if "429" in err_msg or "rate limit" in err_msg.lower():
            # Auto-provision locally with notice
            sync_result = sync_user_to_local_db(
                email=email,
                full_name=full_name,
                phone=phone,
                referral_code=referral_code
            )
            return {
                "success": True,
                "message": "User registered and provisioned in local database (Supabase email delivery rate-limited)",
                "warning": err_msg,
                "email": email,
                "local_user": sync_result["user"],
                "session": None,
                "requires_email_confirmation": False
            }
        return {
            "success": False,
            "error": err_msg,
            "email": email
        }


def tool_supabase_email_login(email: str, password: str) -> Dict[str, Any]:
    """Log in a user using email and password via Supabase Auth."""
    email = email.strip().lower()
    if not email or not password:
        return {"success": False, "error": "Email and password are required"}

    login_payload = {
        "email": email,
        "password": password
    }

    try:
        res = supabase_http_request("/token?grant_type=password", data=login_payload, method="POST")
        access_token = res.get("access_token")
        refresh_token = res.get("refresh_token")
        expires_in = res.get("expires_in")
        sb_user = res.get("user", {})
        user_metadata = sb_user.get("user_metadata", {})

        # Sync with local DB
        sync_result = sync_user_to_local_db(
            email=email,
            full_name=user_metadata.get("full_name", ""),
            phone=user_metadata.get("phone", ""),
            supabase_uid=sb_user.get("id", "")
        )

        return {
            "success": True,
            "message": "Login successful",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expires_in": expires_in,
            "token_type": res.get("token_type", "bearer"),
            "supabase_user": {
                "id": sb_user.get("id"),
                "email": sb_user.get("email"),
                "created_at": sb_user.get("created_at"),
                "metadata": user_metadata
            },
            "local_user": sync_result["user"],
            "session_token": sync_result["session_token"]
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "email": email
        }


def tool_supabase_send_magic_link_or_otp(email: str, create_user: bool = True) -> Dict[str, Any]:
    """Send a passwordless magic link or 6-digit OTP to the user's email."""
    email = email.strip().lower()
    if not email:
        return {"success": False, "error": "Email is required"}

    payload = {
        "email": email,
        "create_user": create_user
    }

    try:
        res = supabase_http_request("/otp", data=payload, method="POST")
        return {
            "success": True,
            "message": f"Magic link / OTP code dispatched to {email}",
            "response": res
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "email": email
        }


def tool_supabase_verify_email_otp(email: str, token: str, type: str = "email") -> Dict[str, Any]:
    """Verify OTP code or magic link token for user login."""
    email = email.strip().lower()
    token = token.strip()
    if not email or not token:
        return {"success": False, "error": "Email and token/OTP code are required"}

    payload = {
        "email": email,
        "token": token,
        "type": type
    }

    try:
        res = supabase_http_request("/verify", data=payload, method="POST")
        sb_user = res.get("user", {})
        user_metadata = sb_user.get("user_metadata", {})

        sync_result = sync_user_to_local_db(
            email=email,
            full_name=user_metadata.get("full_name", ""),
            phone=user_metadata.get("phone", ""),
            supabase_uid=sb_user.get("id", "")
        )

        return {
            "success": True,
            "message": "Email OTP verified successfully",
            "access_token": res.get("access_token"),
            "refresh_token": res.get("refresh_token"),
            "supabase_user": sb_user,
            "local_user": sync_result["user"]
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "email": email
        }


def tool_supabase_reset_password_email(email: str) -> Dict[str, Any]:
    """Send a password reset recovery email to the user."""
    email = email.strip().lower()
    if not email:
        return {"success": False, "error": "Email is required"}

    payload = {"email": email}
    try:
        res = supabase_http_request("/recover", data=payload, method="POST")
        return {
            "success": True,
            "message": f"Password recovery instructions sent to {email}",
            "response": res
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "email": email
        }


def tool_supabase_get_user(access_token: str) -> Dict[str, Any]:
    """Retrieve user details from Supabase using an access token."""
    if not access_token:
        return {"success": False, "error": "Access token is required"}

    try:
        res = supabase_http_request("/user", method="GET", auth_token=access_token)
        return {
            "success": True,
            "user": res
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }



def tool_supabase_sync_user_to_db(email: str, full_name: str = "", phone: str = "", supabase_uid: str = "", referral_code: str = "") -> Dict[str, Any]:
    """Synchronize user profile and wallet with local database."""
    return sync_user_to_local_db(email, full_name, phone, supabase_uid, referral_code)


# ============================================================================
# MCP Tool Definitions & Server Protocol Handler
# ============================================================================

MCP_TOOLS = [
    {
        "name": "supabase_email_signup",
        "description": "Register a new user account with email and password via Supabase Auth, provision financial wallet, and sync with database.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "email": {"type": "string", "description": "User email address (e.g. user@example.com)"},
                "password": {"type": "string", "description": "User password (min 6 characters)"},
                "full_name": {"type": "string", "description": "Full name of the user (optional)"},
                "phone": {"type": "string", "description": "Phone number with country code (optional)"},
                "referral_code": {"type": "string", "description": "Referral sponsor code if any (optional)"}
            },
            "required": ["email", "password"]
        }
    },
    {
        "name": "supabase_email_login",
        "description": "Authenticate user with email and password using Supabase Auth. Returns JWT access token, user session, and synced portfolio profile.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "email": {"type": "string", "description": "User email address"},
                "password": {"type": "string", "description": "User password"}
            },
            "required": ["email", "password"]
        }
    },
    {
        "name": "supabase_send_magic_link_or_otp",
        "description": "Send a passwordless login magic link or 6-digit OTP code to the user's email address.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "email": {"type": "string", "description": "Recipient email address"},
                "create_user": {"type": "boolean", "description": "Whether to auto-create user if not already registered (default: true)"}
            },
            "required": ["email"]
        }
    },
    {
        "name": "supabase_verify_email_otp",
        "description": "Verify an email OTP code or magic link token to authenticate the user and retrieve a valid JWT session.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "email": {"type": "string", "description": "User email address"},
                "token": {"type": "string", "description": "6-digit OTP or magic link verification token"},
                "type": {"type": "string", "enum": ["email", "signup", "recovery", "magiclink"], "description": "Verification type (default: email)"}
            },
            "required": ["email", "token"]
        }
    },
    {
        "name": "supabase_reset_password_email",
        "description": "Trigger a password reset email via Supabase Auth for account recovery.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "email": {"type": "string", "description": "User email address"}
            },
            "required": ["email"]
        }
    },
    {
        "name": "supabase_get_user",
        "description": "Get current authenticated user details and metadata from Supabase Auth using a JWT access token.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "access_token": {"type": "string", "description": "Supabase JWT access token"}
            },
            "required": ["access_token"]
        }
    },
    {
        "name": "supabase_sync_user_to_db",
        "description": "Synchronize a Supabase user with the local fintech database, ledger wallet, and notification inbox.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "email": {"type": "string", "description": "User email address"},
                "full_name": {"type": "string", "description": "User full name (optional)"},
                "phone": {"type": "string", "description": "User phone number (optional)"},
                "supabase_uid": {"type": "string", "description": "Supabase User UUID (optional)"},
                "referral_code": {"type": "string", "description": "Referral sponsor code (optional)"}
            },
            "required": ["email"]
        }
    }
]


def execute_tool(name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Dispatch and execute an MCP tool."""
    try:
        if name == "supabase_email_signup":
            return tool_supabase_email_signup(
                email=arguments.get("email", ""),
                password=arguments.get("password", ""),
                full_name=arguments.get("full_name", ""),
                phone=arguments.get("phone", ""),
                referral_code=arguments.get("referral_code", "")
            )
        elif name == "supabase_email_login":
            return tool_supabase_email_login(
                email=arguments.get("email", ""),
                password=arguments.get("password", "")
            )
        elif name == "supabase_send_magic_link_or_otp":
            return tool_supabase_send_magic_link_or_otp(
                email=arguments.get("email", ""),
                create_user=arguments.get("create_user", True)
            )
        elif name == "supabase_verify_email_otp":
            return tool_supabase_verify_email_otp(
                email=arguments.get("email", ""),
                token=arguments.get("token", ""),
                type=arguments.get("type", "email")
            )
        elif name == "supabase_reset_password_email":
            return tool_supabase_reset_password_email(
                email=arguments.get("email", "")
            )
        elif name == "supabase_get_user":
            return tool_supabase_get_user(
                access_token=arguments.get("access_token", "")
            )
        elif name == "supabase_sync_user_to_db":
            return tool_supabase_sync_user_to_db(
                email=arguments.get("email", ""),
                full_name=arguments.get("full_name", ""),
                phone=arguments.get("phone", ""),
                supabase_uid=arguments.get("supabase_uid", ""),
                referral_code=arguments.get("referral_code", "")
            )
        else:
            return {"error": f"Unknown tool: {name}"}
    except Exception as e:
        return {"error": str(e)}


def handle_jsonrpc_request(req: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Process a single JSON-RPC 2.0 request."""
    method = req.get("method")
    req_id = req.get("id")
    params = req.get("params", {})

    # Ping
    if method == "ping":
        return {"jsonrpc": "2.0", "id": req_id, "result": {}}

    # Initialize
    if method == "initialize":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {
                        "listChanged": False
                    }
                },
                "serverInfo": {
                    "name": "supabase-auth-mcp-server",
                    "version": "1.0.0"
                }
            }
        }

    # Initialized notification (no response needed if no id)
    if method == "notifications/initialized":
        if req_id is not None:
            return {"jsonrpc": "2.0", "id": req_id, "result": {}}
        return None

    # List Tools
    if method == "tools/list":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "tools": MCP_TOOLS
            }
        }

    # Call Tool
    if method == "tools/call":
        tool_name = params.get("name")
        arguments = params.get("arguments", {})
        result = execute_tool(tool_name, arguments)
        is_error = "error" in result and not result.get("success", False)

        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "content": [
                    {
                        "type": "text",
                        "text": json.dumps(result, indent=2)
                    }
                ],
                "isError": is_error
            }
        }

    # Unknown method
    if req_id is not None:
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "error": {
                "code": -32601,
                "message": f"Method not found: {method}"
            }
        }
    return None


def run_stdio_server():
    """Run standard I/O loop for MCP server."""
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
            response = handle_jsonrpc_request(req)
            if response is not None:
                sys.stdout.write(json.dumps(response) + "\n")
                sys.stdout.flush()
        except Exception as e:
            err_resp = {
                "jsonrpc": "2.0",
                "id": None,
                "error": {
                    "code": -32700,
                    "message": f"Parse error: {str(e)}"
                }
            }
            sys.stdout.write(json.dumps(err_resp) + "\n")
            sys.stdout.flush()


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--cli":
        # Interactive CLI test mode
        print("Supabase Auth MCP Server CLI mode")
        print("Available tools:", [t["name"] for t in MCP_TOOLS])
    else:
        run_stdio_server()
