<template>
  <div>
    <div class="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
      <div
        class="relative isolate overflow-hidden bg-red-900 px-6 pt-16 shadow-2xl sm:rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
        <svg viewBox="0 0 1024 1024"
          class="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
          aria-hidden="true">
          <circle cx="512" cy="512" r="512" fill="url(#759c1415-0410-454c-8f7c-9a820de03641)" fill-opacity="0.7" />
          <defs>
            <radialGradient id="759c1415-0410-454c-8f7c-9a820de03641">
              <stop stop-color="#862037" />
              <stop offset="1" stop-color="#c9abaf" />
            </radialGradient>
          </defs>
        </svg>
        <div class="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
          <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Bienvenido a osu!Peru
          </h2>

          <template v-if="loading">
            <p class="mt-6 text-lg leading-8 text-gray-300">
              Cargando
            </p>
          </template>
          <template v-else>
            <template v-if="!user.verified">
              <p class="mt-6 text-lg leading-8 text-gray-300">
                Para verificarte y tener acceso completo al servidor de discord
                verificate aquí.
              </p>
            </template>
            <template v-else>
              <p class="mt-6 text-lg leading-8 text-gray-300">
                Te has verificado como {{ user.osu_username }} ({{ user.discord_username }})
              </p>
            </template>
            <div class="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
              <template v-if="!user.verified">
                <a href="#"
                  class="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  @click="handleAuth">Verificarse</a>
              </template>
              <template v-else>
                <a href="#"
                  class="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  @click="handleDeauth">Eliminar verificacion</a>
              </template>
            </div>
          </template>

        </div>
        <div class="relative mt-16 h-80 lg:mt-8">
          <img class="absolute left-0 top-0 w-[57rem] max-w-none rounded-md bg-white/5 ring-1 ring-white/10"
            src="../assets/background.png" alt="osu!Peru Discord Server" width="1824" height="1080" />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
body {
  background-color: #bf2e41;
}
</style>

<script lang="ts">
import axios, { AxiosResponse } from "axios";

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

export default {
  name: "AuthBox",
  data() {
    return {
      user: <IUser>{},
      loading: true,
    }
  },
  created(): void {
    this.handleRedirect();
    this.reloadData();
  },
  methods: {
    async handleAuth(): Promise<void> {
      const code = this.$route.query.code;
      const state = this.$route.query.state;
      const kohaku_code = this.$route.query.kohaku_code;

      if (kohaku_code && !code && !state) {
        const parameters = {
          client_id: import.meta.env.VITE_OSU_CLIENT_ID,
          redirect_uri: import.meta.env.VITE_OSU_REDIRECT_URI,
          response_type: "code",
          scope: "identify",
          state: this.$route.query.kohaku_code,
        };

        let url = "https://osu.ppy.sh/oauth/authorize?";
        let parameters_array = [];
        for (const [key, value] of Object.entries(parameters)) {
          parameters_array.push(key + "=" + value);
        }
        url += parameters_array.join("&");
        console.log(url);
        window.location.href = url;
      } else {
        alert("El link de verificacion es invalido.");
      }
    },
    async handleDeauth(): Promise<void> {
      const result: AxiosResponse<IUser> = await axios.post(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/deauth`, {
        withCredentials: true,
      });

      if (result.status !== 403) {
        this.user.user_id = undefined;
        this.user.discord_id = undefined;
        this.user.discord_username = undefined;
        this.user.osu_id = undefined;
        this.user.osu_username = undefined;
        this.user.verified = false;
        this.user.verification_code = undefined;
        this.user.access_token = undefined;
        this.user.refresh_token = undefined;
        this.user.created_at = undefined;
        this.user.updated_at = undefined;
      }
    },
    async handleRedirect(): Promise<void> {
      this.loading = true;

      const code = this.$route.query.code;
      const state = this.$route.query.state;
      const kohaku_code = this.$route.query.kohaku_code;

      if (code && state && !kohaku_code && !this.user.verified) {
        const parameters = {
          kohaku_code: state,
          osu_code: code,
        }

        const result: AxiosResponse<IUser> = await axios.post(
          `${import.meta.env.VITE_BACKEND_API_URL}/api/auth`, parameters, {
          withCredentials: true,
        });

        if (result.status !== 403) {
          this.user = result.data;
          this.loading = false;
        }
      } else {
        this.loading = false;
      }
    },
    async reloadData(): Promise<void> {
      try {
        const result: AxiosResponse<IUser> = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/api/user`, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });

        this.loading = false;

        if (result.status !== 403) {
          this.user = result.data;
          this.loading = false;
        }
      } catch (error) {
        // Do nothing
      }
    }
  },
}
</script>