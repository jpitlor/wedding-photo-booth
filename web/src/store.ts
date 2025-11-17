import {
  configureStore,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query";
import type { Metadata, Page } from "./types.ts";

export const appSlice = createSlice({
  name: "app",
  initialState: {
    page: "landing-page" as Page,
    image: null as string | null,
  },
  reducers: {
    setPage(state, action: PayloadAction<Page>) {
      state.page = action.payload;
    },
    setImage(state, action: PayloadAction<string>) {
      state.image = action.payload;
    },
  },
});

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
  }),
  endpoints: (builder) => ({
    getMetadata: builder.query<Metadata, void>({
      query: () => "/metadata",
    }),
    print: builder.mutation<void, FormData>({
      query: (body) => ({
        url: "/print",
        method: "POST",
        body,
      }),
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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
