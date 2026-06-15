{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    dev-python = {
      url = "github:agoose77/dev-flakes/v10?dir=python";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
  outputs = {
    self,
    nixpkgs,
    dev-python,
  }: let
    forAllSystems = nixpkgs.lib.genAttrs nixpkgs.lib.systems.flakeExposed;
  in {
    devShells = forAllSystems (system: let
      pkgs = import nixpkgs {
        inherit system;
        config.allowUnfree = true;
      };

      # Configure the hook for enabling venvs
      # I think there's a way to auto-detect this, but
      # let's worry about that another time
      python = pkgs.python313;
      venvHook =
        dev-python.packages.${system}.nix-ld-venv-hook.override
        {python = python;};

      packages =
        [
          python
          venvHook
        ]
        ++ (with pkgs; [
          cmake
          ninja
          gcc
          pre-commit
          # Infra packages
          nodejs_22
          playwright-driver.browsers
          go-jsonnet
        ]);
      # Unset these unwanted env vars
      # PYTHONPATH bleeds from Nix Python packages
      unwantedEnvPreamble = ''
        unset SOURCE_DATE_EPOCH PYTHONPATH
      '';
    in {
      default = pkgs.mkShell {
        inherit packages;

        # Drop bad env vars on activation
        postShellHook = unwantedEnvPreamble;
        env = {
          PLAYWRIGHT_BROWSERS_PATH = "${pkgs.playwright-driver.browsers}";
          PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = "1";
        };
      };
    });
  };
}
