import { useState } from "react";
import ViewProfile from "./ViewProfile";
import Editprofile from "./Editprofile";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div>
      {isEditing ? (
        <Editprofile onViewProfile={() => setIsEditing(false)} />
      ) : (
        <ViewProfile onEdit={() => setIsEditing(true)} />
      )}
    </div>
  );
};

export default Profile;
