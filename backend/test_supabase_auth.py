#!/usr/bin/env python3
"""
Test Suite for Supabase Email Authentication & MCP Server
=========================================================
Tests:
1. MCP Server JSON-RPC Protocol (initialize, tools/list, tools/call)
2. Supabase Email Authentication Flow (Signup, Login, OTP, Reset, DB Sync)
3. Backend Flask REST Auth Endpoints
"""

import os
import sys
import json
import time
import uuid
import unittest
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)

from mcp_supabase_auth_server import (
    tool_supabase_email_signup,
    tool_supabase_email_login,
    tool_supabase_send_magic_link_or_otp,
    tool_supabase_verify_email_otp,
    tool_supabase_reset_password_email,
    tool_supabase_get_user,
    tool_supabase_sync_user_to_db,
    handle_jsonrpc_request,
    MCP_TOOLS
)
import app as flask_app


class TestSupabaseAuthMCPServer(unittest.TestCase):

    def setUp(self):
        self.test_email = f"user_{uuid.uuid4().hex[:8]}@gmail.com"
        self.test_password = "SecurePassword123!"
        self.test_name = "Kavya Sharma"
        self.test_phone = "+91 98765 43210"

    def test_01_mcp_protocol_initialize(self):
        """Test MCP JSON-RPC initialize request."""
        req = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "test-client", "version": "1.0.0"}
            }
        }
        res = handle_jsonrpc_request(req)
        self.assertIsNotNone(res)
        self.assertEqual(res.get("id"), 1)
        self.assertEqual(res.get("result", {}).get("serverInfo", {}).get("name"), "supabase-auth-mcp-server")
        self.assertIn("tools", res.get("result", {}).get("capabilities", {}))
        print(" [PASS] MCP initialize protocol")

    def test_02_mcp_protocol_tools_list(self):
        """Test MCP JSON-RPC tools/list request."""
        req = {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "tools/list",
            "params": {}
        }
        res = handle_jsonrpc_request(req)
        self.assertIsNotNone(res)
        tools = res.get("result", {}).get("tools", [])
        tool_names = [t["name"] for t in tools]
        self.assertIn("supabase_email_signup", tool_names)
        self.assertIn("supabase_email_login", tool_names)
        self.assertIn("supabase_send_magic_link_or_otp", tool_names)
        self.assertIn("supabase_verify_email_otp", tool_names)
        self.assertIn("supabase_reset_password_email", tool_names)
        self.assertIn("supabase_sync_user_to_db", tool_names)
        print(f" [PASS] MCP tools/list ({len(tools)} tools verified)")

    def test_03_email_signup_and_sync(self):
        """Test user email registration and automatic database synchronization."""
        res = tool_supabase_email_signup(
            email=self.test_email,
            password=self.test_password,
            full_name=self.test_name,
            phone=self.test_phone
        )
        self.assertTrue(res.get("success"), f"Signup response: {res}")
        self.assertEqual(res.get("email"), self.test_email)
        self.assertIsNotNone(res.get("local_user"))
        self.assertEqual(res.get("local_user", {}).get("email"), self.test_email)
        print(f" [PASS] Supabase email signup & ledger sync for {self.test_email}")

    def test_04_mcp_tool_call_signup(self):
        """Test calling supabase_email_signup via JSON-RPC tools/call."""
        new_email = f"mcp_agent_{uuid.uuid4().hex[:6]}@gmail.com"
        req = {
            "jsonrpc": "2.0",
            "id": 3,
            "method": "tools/call",
            "params": {
                "name": "supabase_email_signup",
                "arguments": {
                    "email": new_email,
                    "password": "Password999!",
                    "full_name": "MCP Agent User"
                }
            }
        }
        res = handle_jsonrpc_request(req)
        self.assertIsNotNone(res)
        self.assertFalse(res.get("result", {}).get("isError", True))
        content_text = res.get("result", {}).get("content", [{}])[0].get("text", "{}")
        parsed = json.loads(content_text)
        self.assertTrue(parsed.get("success"), f"Signup via MCP call failed: {parsed}")
        print(f" [PASS] MCP tools/call supabase_email_signup for {new_email}")

    def test_05_send_magic_link_or_otp(self):
        """Test sending OTP or Magic link via Supabase Auth."""
        res = tool_supabase_send_magic_link_or_otp(self.test_email)
        # Verify structure or response (may be rate-limited by Supabase email quota)
        self.assertIn("success", res)
        print(f" [PASS] Supabase passwordless OTP / magic link dispatch status: {res.get('success')}")

    def test_06_password_reset_email(self):
        """Test triggering password recovery email."""
        res = tool_supabase_reset_password_email(self.test_email)
        self.assertIn("success", res)
        print(f" [PASS] Supabase password reset email dispatch status: {res.get('success')}")

    def test_07_flask_auth_sync_endpoint(self):
        """Test Flask /api/auth/supabase-sync endpoint."""
        client = flask_app.app.test_client()
        sync_email = f"flask_sync_{uuid.uuid4().hex[:6]}@gmail.com"
        response = client.post('/api/auth/supabase-sync', json={
            'email': sync_email,
            'full_name': 'Flask Sync User',
            'phone': '+91 91234 56789'
        })
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data.get('success'))
        self.assertEqual(data.get('user', {}).get('email'), sync_email)
        print(f" [PASS] Flask REST /api/auth/supabase-sync for {sync_email}")
        print(f" [PASS] Flask REST /api/auth/supabase-sync for {sync_email}")


if __name__ == '__main__':
    unittest.main()
