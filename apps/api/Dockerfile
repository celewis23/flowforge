FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY MsrCommandCenter.sln ./
COPY apps/api/src/Msr.CommandCenter.Domain/Msr.CommandCenter.Domain/Msr.CommandCenter.Domain.csproj apps/api/src/Msr.CommandCenter.Domain/Msr.CommandCenter.Domain/
COPY apps/api/src/Msr.CommandCenter.Application/Msr.CommandCenter.Application/Msr.CommandCenter.Application.csproj apps/api/src/Msr.CommandCenter.Application/Msr.CommandCenter.Application/
COPY apps/api/src/Msr.CommandCenter.Infrastructure/Msr.CommandCenter.Infrastructure/Msr.CommandCenter.Infrastructure.csproj apps/api/src/Msr.CommandCenter.Infrastructure/Msr.CommandCenter.Infrastructure/
COPY apps/api/src/Msr.CommandCenter.Api/Msr.CommandCenter.Api/Msr.CommandCenter.Api.csproj apps/api/src/Msr.CommandCenter.Api/Msr.CommandCenter.Api/

RUN dotnet restore apps/api/src/Msr.CommandCenter.Api/Msr.CommandCenter.Api/Msr.CommandCenter.Api.csproj

COPY . .
RUN dotnet publish apps/api/src/Msr.CommandCenter.Api/Msr.CommandCenter.Api/Msr.CommandCenter.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Msr.CommandCenter.Api.dll"]
