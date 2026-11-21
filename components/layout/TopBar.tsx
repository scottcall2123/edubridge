import Link from "next/link";
import Image from "next/image";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { UserMenu } from "./UserMenu";
import { DesktopNav } from "./DesktopNav";
export async function TopBar({
  name,
  logout,
}: {
  name?: string;
  logout?: () => Promise<void>;
}) {
  return (
    <header className="bg-navy text-white">
      <div className="container flex h-16 items-center justify-between gap-2">
        <Link href={name ? "/dashboard" : "/"}>
          <Image
            src="/brand/edubridge-logo-horizontal-on-dark.svg"
            width={164}
            height={36}
            className="h-auto w-28 md:w-36 lg:w-[164px]"
            alt="EduBridge"
            priority
          />
        </Link>
        {name && <DesktopNav />}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <UserMenu name={name} logout={logout} />
        </div>
      </div>
    </header>
  );
}
