import ProfileShareButton from "./profile-share-button";

interface ProfileHeaderProps {
  name: string;
  username: string;
  imageUrl?: string | null;
  bio?: string;
  isFeatured?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ProfileHeader({
  name,
  username,
  imageUrl,
  bio,
  isFeatured = false,
}: ProfileHeaderProps) {
  return (
    <div
      data-testid="profile-header"
      className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8"
    >
      {/* Avatar */}
      <div className="shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-20 h-20 rounded-xl object-cover border border-white/15"
          />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-brand-gradient flex items-center justify-center text-white text-2xl font-black">
            {getInitials(name)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">{name}</h1>
            <p className="text-sm text-white/60">@{username}</p>
          </div>
          <ProfileShareButton username={username} />
        </div>
        {bio && (
          <p className="mt-2 text-sm text-white/70 max-w-xl">{bio}</p>
        )}
        {isFeatured && (
          <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full bg-brand-gradient text-white font-medium">
            Featured creator
          </span>
        )}
      </div>
    </div>
  );
}
