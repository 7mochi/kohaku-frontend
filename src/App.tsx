import React from "react";
import axios, { AxiosResponse } from "axios";

const {
  REACT_APP_BACKEND_API_URL,
  REACT_APP_OSU_CLIENT_ID,
  REACT_APP_OSU_REDIRECT_URI,
} = process.env;

const backendApiUrl = REACT_APP_BACKEND_API_URL;
const osuClientID = REACT_APP_OSU_CLIENT_ID;
const osuRedirectURI = REACT_APP_OSU_REDIRECT_URI;

const searchParams = new URLSearchParams(window.location.search);
const code = searchParams.get("code");
const kohaku_code = searchParams.get("kohaku_code");
const state = searchParams.get("state");

interface IProps {}

interface IUser {
  user_id?: number
  discord_id?: string
  discord_username?: string
  osu_id?: string
  osu_username?: string
  verified?: boolean
  verification_code?: string
  access_token?: string
  refresh_token?: string
  created_at?: Date
  updated_at?: Date
}

interface IState {
  user: IUser | null;
}

class App extends React.Component<IProps, IState> {
  state: IState = {
    user: null,
  };

  async componentDidMount() {
    await this.handleRedirect();
    await this.reloadData();
  }

  async reloadData() {
    try {
      const result: AxiosResponse<IUser> = await axios.get(`${backendApiUrl}/api/user`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (result.status !== 403) {
        this.setState({ user: result.data });
      }
    } catch (error) {
      // TODO: Handle error or something
    }
  }

  async handleRedirect() {
    const verified = this.state.user?.verified ?? false;

    if (code && state && !kohaku_code && !verified) {
      const parameters = {
        kohaku_code: state,
        osu_code: code,
      };

      try {
        const result: AxiosResponse<IUser> = await axios.post(`${backendApiUrl}/api/auth`, parameters, {
          withCredentials: true,
        });

        if (result.status !== 403) {
          this.setState({ user: result.data });
        }
      } catch (error) {
        // TODO: Handle error or something
      }
    }
  }

  async handleVerification() {
    if (kohaku_code && !code && !state) {
      const parameters = {
        client_id: osuClientID,
        redirect_uri: osuRedirectURI,
        response_type: "code",
        scope: "identify",
        state: kohaku_code,
      };

      const parametersArray = Object.entries(parameters).map(([key, value]) => `${key}=${value}`);
      const url = "https://osu.ppy.sh/oauth/authorize?" + parametersArray.join("&");
      window.location.href = url;
    } else {
      // TODO: Handle error or something
    }
  }

  render(): React.ReactNode {
    const verified = this.state.user?.verified ?? false;

    return (
      <div>
        {!verified ? (
          <button onClick={this.handleVerification}>
            Verificarse
          </button>
        ) : (
          <div>Bienvenido a Kohaku! {this.state.user?.osu_username} {this.state.user?.discord_username}</div>
        )}
      </div>
    );
  }
}

export default App;