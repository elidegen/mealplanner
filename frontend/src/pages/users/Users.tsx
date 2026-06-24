import { useState } from "react";
import type { IUser } from "../../types/ListTypes";
import IconArrowUp from "../../assets/img/icon_arrow_up_green.svg?react";
import IconArrowDown from "../../assets/img/icon_arrow_down_red.svg?react";
import IconTrash from "../../assets/img/icon_trash.svg?react";
import IconAdd from "../../assets/img/icon_add.svg?react";
import dude from "../../assets/img/dude.jpg";
import dude2 from "../../assets/img/dude2.webp";
import "./Users.css";

const DUMMY_USERS: IUser[] = [
  { id: "1", name: "Batuhan", rights: "Admin", img: dude },
  { id: "2", name: "Elijah", rights: "User", img: dude2 },
];

function Users() {
  const [users, setUsers] = useState<IUser[]>(DUMMY_USERS);

  function changeRights(id: string) {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? { ...user, rights: user.rights === "Admin" ? "User" : "Admin" }
          : user
      )
    );
  }

  function deleteUser(id: string) {
    setUsers((prev) => prev.filter((user) => user.id !== id));
  }

  return (
    <div className="users-wrapper">
      <div className="users-overview">
        {users.map((user) => (
          <div key={user.id} className="user-box">
            <img className="user-img" src={user.img} alt={user.name} />
            <h2 className="user-name">{user.name}</h2>
            <button
              className="icon-button"
              onClick={() => changeRights(user.id)}
            >
              {user.rights === "Admin" ? <IconArrowDown /> : <IconArrowUp />}
            </button>
            <button
              className="icon-button"
              onClick={() => deleteUser(user.id)}
            >
              <IconTrash />
            </button>
          </div>
        ))}
      </div>
      <div className="button-wrapper">
        <button className="icon-button add-user-button">
          <span>Add a user</span>
          <IconAdd />
        </button>
      </div>
    </div>
  );
}

export default Users;
