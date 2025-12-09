# code-owner: @agoose77
# This flake sets up an dev-shell that installs all the required
# packages for running deployer, and then installs the tool in the virtual environment
# It is not best-practice for the nix-way of distributing this code,
# but its purpose is to get an environment up and running.
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {
        inherit system;
        config.allowUnfree = true;
      };
      inherit (pkgs) lib;

      python = pkgs.python313;
      packages =
        [
          python
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
      shellHook = ''
        # Unset leaky PYTHONPATH
        unset PYTHONPATH

        __hash=$(echo ${python.interpreter} | sha256sum)

        # Setup if not defined ####
        if [[ ! -f ".venv/$__hash" ]]; then
            __setup_env() {
                # Remove existing venv
                if [[ -d .venv ]]; then
                    rm -r .venv
                fi

                # Stand up new venv
                ${python.interpreter} -m venv .venv

                ".venv/bin/python" -m pip install -e ".[dev]"

                # Add a marker that marks this venv as "ready"
                touch ".venv/$__hash"
            }

            __setup_env
        fi
        ###########################
        # Activate venv
        source .venv/bin/activate

        export PLAYWRIGHT_BROWSERS_PATH=${pkgs.playwright-driver.browsers}
        export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true
      '';
      env = lib.optionalAttrs pkgs.stdenv.isLinux {
        # Python uses dynamic loading for certain libraries.
        # We'll set the linker path instead of patching RPATH
        LD_LIBRARY_PATH = lib.makeLibraryPath pkgs.pythonManylinuxPackages.manylinux2014;
      };
    in {
      devShell = pkgs.mkShell {
        inherit env packages shellHook;
      };
    });
}
