FROM mcr.microsoft.com/dotnet/runtime:9.0 AS base
USER $APP_UID
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["dev.pitlor.wedding-photo-booth.api/dev.pitlor.wedding-photo-booth.api.csproj", "dev.pitlor.wedding-photo-booth.api/"]
RUN dotnet restore "dev.pitlor.wedding-photo-booth.api/dev.pitlor.wedding-photo-booth.api.csproj"
COPY . .
WORKDIR "/src/dev.pitlor.wedding-photo-booth.api"
RUN dotnet build "./dev.pitlor.wedding-photo-booth.api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./dev.pitlor.wedding-photo-booth.api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "dev.pitlor.wedding-photo-booth.api.dll"]
