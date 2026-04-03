.PHONY: help build deploy publish clean

# Default target
help:
	@echo "Usage:"
	@echo "  make build       - Build the project"
	@echo "  make deploy      - Bump version, build, and publish to Artifactory"
	@echo "  make publish     - Synonym for deploy"
	@echo "  make clean       - Remove dist directory"

# Build the library
build:
	npm run build

# Publish the library (pre-build included via npm prepublishOnly)
deploy:
	npm version patch
	npm run deploy

# Synonym for deploy
publish: deploy

# Clean build artifacts
clean:
	rm -rf dist
