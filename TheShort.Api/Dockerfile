FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY TheShort.sln .
COPY TheShort.Domain/*.csproj TheShort.Domain/
COPY TheShort.Application/*.csproj TheShort.Application/
COPY TheShort.Persistence/*.csproj TheShort.Persistence/
COPY TheShort.Infrastructure/*.csproj TheShort.Infrastructure/
COPY TheShort.Api/*.csproj TheShort.Api/
RUN dotnet restore TheShort.Api/TheShort.Api.csproj

COPY . .
WORKDIR /src/TheShort.Api
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app .
EXPOSE 8080
ENTRYPOINT ["dotnet", "TheShort.Api.dll"]
