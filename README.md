# BAW Secure Chat

# Wprowadznie

Celem projektu było zapoznanie się z protokołem wymiany klucza [Diffiego-Hellmana](https://pl.wikipedia.org/wiki/Protok%C3%B3%C5%82_Diffiego-Hellmana).

W ramach projektu przygotowano demonstracyjny system czatu rzeczywistego.

# Wymagania systemowe

Do skompilowania i uruchomienia projektu wymagane są:
- komputer z zainstalowanym 64-bitowym systemem operacyjnym, wspieranym przez SDK .NET w wersji 7.0.302,
- zainstalowane SDK .NET w wersji 7.0.302 lub wyższym,
- przeglądarka internetowa obsługująca JavaScript w standardzie ECMAScript 2021

# Instalacja i uruchomienie

## Instalacja

1. Otwórz wiersz poleceń/terminal w folderze z plikami projektu
2. Wykonaj następujące polecenia:
    - `dotnet restore`
    - `dotnet tool install --global dotnet-ef`
    - `dotnet ef database update`
    - `dotnet dev-certs https --clean`

## Uruchomienie

W celu uruchomienia systemu wykonaj polecenie `dotnet run`