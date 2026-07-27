import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import IconArrowUp from "../../assets/img/icon_arrow_up_green.svg?react";
import IconArrowDown from "../../assets/img/icon_arrow_down_red.svg?react";
import IconTrash from "../../assets/img/icon_trash.svg?react";
import { useAuth } from "../../auth/AuthContext";
import { useHome } from "../../home/HomeContext";
import "./Users.css";

type Role = "admin" | "user" | "gast";

type Member = {
  userId: number;
  name: string;
  email: string;
  role: Role;
};

// Rangfolge von wenig zu viel Rechten — daraus leiten sich Auf- und Abstieg ab
const ROLE_ORDER: Role[] = ["gast", "user", "admin"];

const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  user: "User",
  gast: "Gast",
};

function Users() {
  const { token, user } = useAuth();
  const { activeHome, refreshHomes } = useHome();
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = activeHome?.role === "admin";

  useEffect(() => {
    if (!activeHome || !token) return;
    setLoading(true);
    setError(null);
    fetch(`/api/homes/${activeHome.id}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json() as Promise<Member[]>;
      })
      .then(setMembers)
      .catch(() => setError("Mitglieder konnten nicht geladen werden"))
      .finally(() => setLoading(false));
  }, [activeHome, token]);

  async function changeRole(member: Member, direction: 1 | -1) {
    if (!activeHome) return;
    const next = ROLE_ORDER[ROLE_ORDER.indexOf(member.role) + direction];
    if (!next) return;
    setError(null);

    try {
      const res = await fetch(
        `/api/homes/${activeHome.id}/members/${member.userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: next }),
        },
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Rolle konnte nicht geändert werden");
      }
      setMembers((prev) =>
        prev.map((m) =>
          m.userId === member.userId ? { ...m, role: next } : m,
        ),
      );
      // Eigene Rolle geändert? Dann muss der HomeContext nachziehen,
      // sonst zeigt die Oberfläche weiter Admin-Rechte an, die es nicht mehr gibt.
      if (member.userId === user?.id) await refreshHomes();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Rolle konnte nicht geändert werden");
    }
  }

  async function removeMember(member: Member) {
    if (!activeHome) return;
    setError(null);
    try {
      const res = await fetch(
        `/api/homes/${activeHome.id}/members/${member.userId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Mitglied konnte nicht entfernt werden");
      }
      setMembers((prev) => prev.filter((m) => m.userId !== member.userId));
      // Selbst ausgetreten: Home ist weg, also Liste neu laden und wegnavigieren
      if (member.userId === user?.id) {
        await refreshHomes();
        navigate("/home");
      }
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Mitglied konnte nicht entfernt werden",
      );
    }
  }

  if (!activeHome) {
    return <p className="users-hint">Kein Home ausgewählt.</p>;
  }

  return (
    <div className="users-wrapper">
      {error && <p className="users-error">{error}</p>}

      {loading ? (
        <p className="users-hint">Lädt…</p>
      ) : (
        <div className="users-overview">
          {members.map((member) => {
            const isSelf = member.userId === user?.id;
            const canPromote = isAdmin && member.role !== "admin";
            const canDemote = isAdmin && member.role !== "gast";
            // Andere entfernen darf nur ein Admin, austreten darf jeder selbst
            const canRemove = isAdmin || isSelf;

            return (
              <div key={member.userId} className="user-box">
                <div className="user-avatar">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <h2 className="user-name">
                    {member.name}
                    {isSelf && <span className="user-self"> (Du)</span>}
                  </h2>
                  <span className="user-email">{member.email}</span>
                </div>
                <span className={`user-role role-${member.role}`}>
                  {ROLE_LABEL[member.role]}
                </span>

                {canPromote && (
                  <button
                    className="icon-button"
                    title="Befördern"
                    onClick={() => changeRole(member, 1)}
                  >
                    <IconArrowUp />
                  </button>
                )}
                {canDemote && (
                  <button
                    className="icon-button"
                    title="Degradieren"
                    onClick={() => changeRole(member, -1)}
                  >
                    <IconArrowDown />
                  </button>
                )}
                {canRemove && (
                  <button
                    className="icon-button"
                    title={isSelf ? "Home verlassen" : "Entfernen"}
                    onClick={() => removeMember(member)}
                  >
                    <IconTrash />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isAdmin && activeHome.joinCode && (
        <div className="invite-box">
          <span className="invite-label">Einladungscode</span>
          <p className="invite-code">{activeHome.joinCode}</p>
          <span className="invite-hint">
            Wer diesen Code eingibt, tritt dem Home als User bei.
          </span>
        </div>
      )}
    </div>
  );
}

export default Users;
