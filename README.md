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

# Użytkowanie

## Logowanie

Po otwarciu strony pod adresem i portem wypisanym w konsoli serwera pojawi się strona logowania. W celu zalogowania się należy w formularzu wprowadzić dane logowania i nacisnąć przycisk `Login`. Po zalogowaniu użytkownik zostanie przeniesiony na stronę `NewChat`.

## Rejestracja

W celu utworzenia nowego użytkownika należy przejść do podstrony `Register` za pomocą przycisku `Register` znajdującym się na górnym menu aplikacji. Należy wypełnić formularz (hasło musi mieć co najmniej 4 znaki) i nacisnąć przycisk `Register`. Po prawidłowym utworzeniu konta na serwerze, użytkownik zostanie przeniesiony na stronę logowania.

## Rozpoczęcie nowego czatu

Po zalogowaniu, użytkownik zostanie przeniesiony na stronę `NewChat`. Po wprowadzeniu nazwy użytkownika do rozmowy i naciśnięciu przycisku `Connect`, użytkownik zostanie przeniesiony na stronę `Chat`. Jeżeli nazwa użytkownika do rozmowy nie istnieje, zostanie wyświetlony komunikat o błędzie.

## Czat

Na stronie `Chat` można przeprowadzać rozmowę między użytkownikami. Po dołączeniu do czatu przycisk `Send Message` jest zablokowany do momentu połączenia z odbiorcą. Za pomocą listy `Encryption Method` użytkownik może wybrać sposób szyfrowania wiadomości. Domyślnie ustawiony jest `None`, czyli brak szyfrowania.
