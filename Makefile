.PHONY: docs clean

# docs:
# 	sphinx-build -M html "docs" "build"

clean:
	rm -rf build
	rm -rf dist
	yarn clean:all

build: clean
	python -m build

deploy-check:
	python -m twine check dist/*

deploy-test:
	python -m twine upload --repository-url=https://test.pypi.org/legacy/ dist/*

deploy: deploy-check
	python -m twine upload dist/*
