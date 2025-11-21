// components/ui/header/index.tsx
import { checkUser } from "@/lib/checkUser";
import HeaderClient from "./HeaderClient";

const Header = async () => {
  // Sync Clerk user to database (runs on every page load)
  // This ensures users are automatically created in DB after sign-in
  try {
    await checkUser();
  } catch (error) {
    // Silently handle errors - don't break the header if sync fails
    console.error("Header: Error syncing user:", error);
  }
  
  return <HeaderClient />;
};

export default Header;
