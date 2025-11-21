import {
  configureStore,
  buildCreateSlice,
  type PayloadAction,
  asyncThunkCreator,
} from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query";
import type { Metadata, Page } from "./types.ts";

const createSlice = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

export const appSlice = createSlice({
  name: "app",
  initialState: {
    timeoutId: null as number | null,
    page: "landing-page" as Page,
    image: null as string | null,
  },
  reducers: (create) => ({
    setPage: create.reducer((state, action: PayloadAction<Page>) => {
      state.page = action.payload;
    }),
    setImage: create.reducer((state, action: PayloadAction<string>) => {
      state.image = action.payload;
    }),
    setTimeout: create.reducer((state, action: PayloadAction<number>) => {
      if (state.timeoutId) {
        clearTimeout(state.timeoutId);
      }

      state.timeoutId = action.payload;
    }),
    resetTimeout: create.asyncThunk(async (_, thunkAPI) => {
      const timeoutId = setTimeout(() => {
        thunkAPI.dispatch(appSlice.actions.setPage("landing-page"));
      }, 20_000);

      thunkAPI.dispatch(appSlice.actions.setTimeout(timeoutId));
    }),
  }),
});

interface GetLogsResponse {
  logs: string;
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
  }),
  endpoints: (builder) => ({
    getMetadata: builder.query<Metadata, void>({
      query: () => "/metadata",
    }),
    print: builder.mutation<string, FormData>({
      query: (body) => ({
        url: "/print",
        method: "POST",
        body,
      }),
    }),
    resetMosaic: builder.mutation<void, void>({
      query: () => ({
        url: "/reset",
        method: "POST",
      }),
    }),
    getLogs: builder.query<GetLogsResponse, void>({
      query: () => "/logs",
    }),
  }),
});

export const store = configureStore({
  reducer: {
    [appSlice.reducerPath]: appSlice.reducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});
