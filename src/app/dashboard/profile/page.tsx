import { PageHeader } from "@/components/page-header";
import { ProfileClient } from "@/components/dashboard/profile/profile-client";

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Your Profile"
        description="Manage your account and farm details."
      />
      <ProfileClient />
    </div>
  );
}
