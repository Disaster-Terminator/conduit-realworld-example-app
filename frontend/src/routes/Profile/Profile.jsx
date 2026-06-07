import { Outlet, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthorInfo from "../../components/AuthorInfo";
import ContainerRow from "../../components/ContainerRow";
import NavItem from "../../components/NavItem";

function Profile() {
  const { state } = useLocation();
  const { username } = useParams();
  const { loggedUser } = useAuth();
  const isSelf = Boolean(
    loggedUser?.username && username && loggedUser.username === username,
  );

  return (
    <div className="profile-page">
      <div className="user-info">
        <ContainerRow>
          <AuthorInfo />
        </ContainerRow>
      </div>

      <ContainerRow>
        <div className="col-xs-12 col-md-10 offset-md-1">
          <div className="articles-toggle">
            <ul className="nav nav-pills outline-active">
              <NavItem text="My Articles" url="" state={state} />
              <NavItem text="Favorited Articles" url="favorites" state={state} />
              {isSelf && <NavItem text="Drafts" url="drafts" state={state} />}
            </ul>
          </div>
          <Outlet />
        </div>
      </ContainerRow>
    </div>
  );
}

export default Profile;
