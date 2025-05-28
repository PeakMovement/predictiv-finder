
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProfileService } from '@/services/profile-service';
import { LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface UserProfileMenuProps {
  openLoginModal: () => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ openLoginModal }) => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  
  useEffect(() => {
    if (currentUser) {
      loadProfile();
    }
  }, [currentUser]);

  const loadProfile = async () => {
    try {
      const userProfile = await ProfileService.getCurrentUserProfile();
      setProfile(userProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  // If not authenticated, show sign in button
  if (!isAuthenticated) {
    return (
      <Button 
        onClick={openLoginModal}
        className="bg-health-purple hover:bg-health-purple-dark"
      >
        Sign In
      </Button>
    );
  }
  
  // Get user initials for avatar fallback
  const getUserInitials = () => {
    const name = profile?.full_name || currentUser?.email;
    if (!name) return "U";
    
    return name
      .split(' ')
      .map((part: string) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const displayName = profile?.full_name || currentUser?.email || "User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarImage 
              src={profile?.avatar_url || undefined} 
              alt={displayName} 
            />
            <AvatarFallback className="bg-health-teal text-white">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          {displayName}
          <p className="text-sm font-normal text-gray-500 truncate max-w-[200px]">
            {currentUser?.email}
          </p>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
          <User className="h-4 w-4" />
          <span>My Profile</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
