{
  pkgs,
  lib,
  config,
  inputs,
  ...
}: {
  packages = with pkgs; [
    pnpm
  ];

  languages.typescript.enable = true;
}
