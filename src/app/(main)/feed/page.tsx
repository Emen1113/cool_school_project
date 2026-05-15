import { ActivityList } from "@/components/feed/activity-list";
import { getActivityFeed } from "@/services/activity.service";

export default async function FeedPage() {
  const items = await getActivityFeed(40);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black text-white">Activity</h1>
        <p className="text-sm text-white/50">Live wins, streaks & milestones</p>
      </header>
      <ActivityList initialItems={items} />
    </div>
  );
}
