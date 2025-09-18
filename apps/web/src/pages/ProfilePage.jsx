import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useGetMeQuery, useUpdateMeMutation } from "@/features/api/user.api";

// UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Icons
import { User, Phone, ShieldCheck, Calendar, Edit2, Save, X } from 'lucide-react';

// A reusable component for displaying profile information
const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center space-x-4">
    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-slate-100 rounded-lg">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-800">{value}</p>
    </div>
  </div>
);

// A visual component for the Trust Score
const TrustScoreIndicator = ({ score }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setDisplayScore(score));
    return () => cancelAnimationFrame(animation);
  }, [score]);

  const getScoreColor = (s) => {
    if (s > 80) return "text-green-500";
    if (s > 50) return "text-yellow-500";
    return "text-red-500";
  };

  const circumference = 2 * Math.PI * 45; // radius = 45
  const offset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <svg className="absolute w-full h-full" viewBox="0 0 100 100">
        <circle
          className="text-slate-200"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
        />
        <circle
          className={`${getScoreColor(score)} transition-all duration-1000 ease-out`}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="text-center">
        <p className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</p>
        <p className="text-xs font-medium text-slate-500">Trust Score</p>
      </div>
    </div>
  );
};

export default function ProfilePage() {
  const { user: authedUser } = useSelector((s) => s.auth);
  const { data: me, isLoading } = useGetMeQuery(undefined, { refetchOnMountOrArgChange: true });
  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation();

  const user = me || authedUser;
  
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone_number: "" });

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || "",
        phone_number: user.phone_number || "",
      });
    }
  }, [user]);

  const onSave = async () => {
    try {
      await updateMe({ full_name: form.full_name, phone_number: form.phone_number }).unwrap();
      setIsEditing(false);
    } catch (e) {
      console.error("Failed to update profile:", e);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return names[0].slice(0, 2);
  };
  
  const formattedJoinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'N/A';

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <Card className="overflow-hidden shadow-xl rounded-2xl border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Left Column - User Identity */}
            <div className="md:col-span-1 bg-slate-100 p-8 flex flex-col items-center text-center">
              <div className="relative w-32 h-32 mb-4">
                <div className="w-full h-full rounded-full bg-indigo-600 flex items-center justify-center text-white text-4xl font-bold ring-4 ring-white">
                  {getInitials(user.full_name)}
                </div>
              </div>
              <h1 className="text-3xl font-bold text-slate-900">{user.full_name}</h1>
              <Badge variant="secondary" className="mt-2 capitalize bg-indigo-200 text-indigo-800">
                {user.role}
              </Badge>
              <Separator className="my-6" />
              <div className="flex items-center space-x-3 text-slate-600">
                <Calendar size={20} />
                <span>Member since {formattedJoinDate}</span>
              </div>
            </div>

            {/* Right Column - Details & Actions */}
            <div className="md:col-span-2 p-8">
              {!isEditing ? (
                <>
                  <CardHeader className="p-0 mb-6 flex-row justify-between items-center">
                    <CardTitle className="text-2xl font-bold text-slate-800">Account Details</CardTitle>
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit2 size={16} className="mr-2" />
                      Edit Profile
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0 space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <InfoItem icon={<Phone size={24} className="text-indigo-600" />} label="Phone Number" value={user.phone_number} />
                      <InfoItem icon={<User size={24} className="text-indigo-600" />} label="User ID" value={user.id} />
                    </div>
                    <div className="flex justify-center pt-4">
                      <TrustScoreIndicator score={user.trust_score} />
                    </div>
                  </CardContent>
                </>
              ) : (
                <>
                  <CardHeader className="p-0 mb-6">
                    <CardTitle className="text-2xl font-bold text-slate-800">Edit Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-6">
                    <div>
                      <label htmlFor="full_name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                      <Input id="full_name" value={form.full_name} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))} />
                    </div>
                    <div>
                      <label htmlFor="phone_number" className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                      <Input id="phone_number" value={form.phone_number} onChange={(e) => setForm(f => ({ ...f, phone_number: e.target.value }))} />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <Button variant="ghost" onClick={() => setIsEditing(false)}>
                        <X size={16} className="mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={onSave} disabled={isSaving}>
                        <Save size={16} className="mr-2" />
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </CardContent>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}