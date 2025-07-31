!include "MUI2.nsh"

Name "7Dollar Printer Driver"
OutFile "7DollarPrinterDriver-Setup.exe"
InstallDir "$PROGRAMFILES\7DollarPrinterDriver"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_LANGUAGE "English"

Section "Install"
  SetOutPath $INSTDIR
  
  File /r "dist\win-unpacked\*.*"
  
  CreateDirectory "$SMPROGRAMS\7Dollar Printer Driver"
  CreateShortCut "$SMPROGRAMS\7Dollar Printer Driver\7Dollar Printer Driver.lnk" "$INSTDIR\7DollarPrinterDriver.exe"
  CreateShortCut "$DESKTOP\7Dollar Printer Driver.lnk" "$INSTDIR\7DollarPrinterDriver.exe"
  
  WriteUninstaller "$INSTDIR\uninstall.exe"
SectionEnd

Section "Uninstall"
  Delete "$INSTDIR\uninstall.exe"
  RMDir /r "$INSTDIR"
  Delete "$SMPROGRAMS\7Dollar Printer Driver\7Dollar Printer Driver.lnk"
  RMDir "$SMPROGRAMS\7Dollar Printer Driver"
  Delete "$DESKTOP\7Dollar Printer Driver.lnk"
SectionEnd 