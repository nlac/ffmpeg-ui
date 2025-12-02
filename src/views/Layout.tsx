import React from "react";
import { Route, NavLink, withRouter } from "react-router-dom";
import Tooltip from "../services/Tooltip";
import Persistence from "../services/Persistence";
import CreatableSelect from "react-select/creatable";
import Home from "./Home";
import WorkFlow from "./WorkFlow";
import About from "./About";
import Repository from "../services/Repository";

const isActive = (path: any) => {
  return !!(path === (window as any).location.pathname);
};

class Layout extends React.Component<any, any> {
  ready: boolean = true;
  base = "/";

  constructor(props: any) {
    super(props);

    const name = this.loadProjectFromStateChange();
    if (name && this.onProjectPage()) {
      Repository.loadProject(name);
    }

    this.state = {
      selectedProjectName: name, // the project name currently selected in the creatable select
      loadedProjectName: name, // the project name in the url = the project currently loaded
    };

    this.props.history.listen((location: any, action: string) => {
      if (!this.onProjectPage(location)) {
        return;
      }

      const name = this.loadProjectFromStateChange(location.pathname);
      Repository.loadProject(name);
      this.ready = false;
      this.setState(
        {
          selectedProjectName: name,
          loadedProjectName: name,
        },
        () => {
          this.ready = true;
          this.forceUpdate();
        }
      );
    });
  }

  onProjectPage(loc?: any) {
    loc = loc || this.props.location;
    return !!loc.pathname.match(/new-project/);
  }

  loadProjectFromStateChange(path?: string) {
    // get selected project name from url
    path = String(path || this.props.history.location.pathname);
    let m: any,
      selectedProjectName: string = "";
    if ((m = path.match(/new-project\/(.+)/))) {
      selectedProjectName = m[1];
    }

    return selectedProjectName;
  }

  onNavClick = () => {
    this.forceUpdate();
  };

  navItem = (props: any) => {
    return (
      <li
        onClick={this.onNavClick}
        className={
          (props.className || "") + (isActive(props.path) ? " active" : "")
        }
      >
        <NavLink to={props.path} activeClassName="active">
          {props.title}
        </NavLink>
      </li>
    );
  };

  projects = () => {
    return Persistence.instance()
      .getProjectNames()
      .map((name) => {
        return {
          value: name,
          label: name,
        };
      });
  };

  getNewOptionData = (inputValue: string, optionLabel?: any) => {
    return {
      value: "" + (inputValue || ""),
      label: "" + (inputValue || ""),
    };
  };

  // current value in the creatable select
  getSelectedProject = () => {
    if (
      this.state.selectedProjectName === "" ||
      this.state.selectedProjectName === undefined
    ) {
      return undefined;
    }

    let selected = this.projects().find(
      (p) => p.value === this.state.selectedProjectName
    );
    if (selected !== undefined) {
      return selected;
    }
    return this.getNewOptionData(this.state.selectedProjectName);
  };

  // on select change do nothing, just update selectedProjectName
  onSelectProjectChange = (v: any) => {
    if (v && v.value) {
      this.setState({
        selectedProjectName: v.value,
      });
    }
  };

  // pressing button "load": push the new state
  load = () => {
    // TODO: some validation here
    if (!this.state.selectedProjectName) {
      this.setState(
        {
          selectedProjectName: "MyProject",
        },
        () => {
          this.props.history.push(
            this.base + "new-project/" + this.state.selectedProjectName
          );
        }
      );
    } else {
      this.props.history.push(
        this.base + "new-project/" + this.state.selectedProjectName
      );
    }
  };

  saveAs = () => {
    Repository.saveProject(this.state.selectedProjectName);
    if (this.state.selectedProjectName != this.state.loadedProjectName) {
      this.props.history.push(
        this.base + "new-project/" + this.state.selectedProjectName
      );
    }
  };

  delete = () => {
    Repository.deleteProject(this.state.selectedProjectName);
    this.props.history.push(this.base + "new-project/MyProject");
  };

  render() {
    const NavItem = this.navItem.bind(this);

    return (
      this.ready && (
        <div>
          <nav className="navbar navbar-inverse navbar-fixed-top">
            <div className="container">
              <div className="navbar-header">
                <NavLink
                  className="navbar-brand"
                  to={this.base}
                  activeClassName="active"
                  isActive={isActive}
                >
                  FFMpeg UI
                </NavLink>
              </div>
              <div className="collapse navbar-collapse">
                <ul className="nav navbar-nav pull-right">
                  <NavItem
                    className="hidden new-project-link"
                    title="New project"
                    path={
                      this.base +
                      "new-project/" +
                      this.state.selectedProjectName
                    }
                  ></NavItem>
                  <NavItem title="About" path={this.base + "about"}></NavItem>
                </ul>
                <form className="navbar-form navbar-right">
                  <div className="form-group">
                    <CreatableSelect
                      className="project-selector"
                      placeholder="project name"
                      options={this.projects()}
                      getOptionLabel={(opt) => opt.label}
                      getOptionValue={(opt) => opt.value}
                      value={this.getSelectedProject()}
                      getNewOptionData={this.getNewOptionData}
                      onChange={this.onSelectProjectChange}
                    ></CreatableSelect>
                  </div>
                  &nbsp;
                  <div className="btn-group">
                    <Tooltip
                      content="Create a new project or load an existing one"
                      placement="bottom"
                    >
                      <button
                        disabled={
                          this.onProjectPage() &&
                          this.state.loadedProjectName ===
                            this.state.selectedProjectName
                        }
                        type="button"
                        className="btn btn-primary"
                        onClick={this.load}
                      >
                        Load/New
                      </button>
                    </Tooltip>

                    <Tooltip
                      content="Save the current project to the local storage (without media)"
                      placement="bottom"
                    >
                      <button
                        disabled={
                          !this.onProjectPage() || !this.state.loadedProjectName
                        }
                        type="button"
                        className="btn btn-success"
                        onClick={this.saveAs}
                      >
                        Save
                      </button>
                    </Tooltip>

                    <Tooltip
                      content="Delete the current project from the local storage"
                      placement="bottom"
                    >
                      <button
                        disabled={
                          !this.onProjectPage() || !this.state.loadedProjectName
                        }
                        type="button"
                        className="btn btn-danger"
                        onClick={this.delete}
                      >
                        Delete
                      </button>
                    </Tooltip>
                  </div>
                </form>
              </div>
            </div>
          </nav>
          <section className="container">
            <Route path={this.base} exact component={Home} />
            {this.state.loadedProjectName && (
              <Route
                path={this.base + "new-project/:name"}
                exact
                component={WorkFlow}
              />
            )}
            <Route path={this.base + "about"} exact component={About} />
          </section>
        </div>
      )
    );
  }
}

export default withRouter(Layout);
