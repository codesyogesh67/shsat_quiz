"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Crown, Mail, Lock, Settings, Sparkles } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-6 px-4 md:px-6 py-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Profile Settings
        </h1>
        <p className="text-sm text-slate-500">
          Manage your account, membership, and preferences.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="xl:col-span-2 space-y-6">
          {/* Student Overview */}
          <Card className="rounded-3xl border-slate-200/70 bg-white shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Student Profile</p>
                  <p className="text-lg font-semibold text-slate-900">
                    Yogesh Pradhan
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm text-slate-900">yogesh@email.com</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Member Since</p>
                  <p className="text-sm text-slate-900">Jan 2026</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card className="rounded-3xl border-slate-200/70 bg-white shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Settings className="h-5 w-5 text-slate-600" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Account Settings
                </h2>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm text-slate-600 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <div className="flex gap-2">
                  <Input placeholder="Enter new email" />
                  <Button className="rounded-xl bg-slate-900 hover:bg-slate-800">
                    Update
                  </Button>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm text-slate-600 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Change Password
                </label>
                <div className="flex gap-2">
                  <Input type="password" placeholder="New password" />
                  <Button className="rounded-xl bg-slate-900 hover:bg-slate-800">
                    Update
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Preferences */}
          <Card className="rounded-3xl border-slate-200/70 bg-white shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Learning Preferences
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">
                    Daily Study Goal (minutes)
                  </p>
                  <Input placeholder="e.g. 30" />
                </div>

                <div>
                  <p className="text-xs text-slate-500">Focus Mode</p>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-slate-200 hover:bg-slate-50"
                  >
                    Focus on Weak Areas
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Membership Card */}
          <Card className="rounded-3xl border-slate-200/70 bg-white shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center">
                  <Crown className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Membership</p>
                  <p className="text-lg font-semibold text-slate-900">
                    Free Plan
                  </p>
                </div>
              </div>

              <Badge className="bg-slate-100 text-slate-700 rounded-lg">
                Limited Access
              </Badge>

              <Button className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20">
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="rounded-3xl border-slate-200/70 bg-white shadow-sm">
            <CardContent className="p-6 space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">Security</h2>

              <Button
                variant="outline"
                className="w-full rounded-xl border-slate-200 hover:bg-slate-50"
              >
                Logout from all devices
              </Button>

              <Button
                variant="outline"
                className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50"
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
