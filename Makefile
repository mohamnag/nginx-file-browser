# Defaults to "0.0.0" when there is none
LATEST_GIT_TAG = $(shell git describe --tags --abbrev=0 2>/dev/null || echo "0.0.0")
# Increase patch version (+1)
NEW_GIT_TAG = $(shell echo $(LATEST_GIT_TAG) | awk '/^([0-9]+)\.([0-9]+)\.([0-9]+)$$/{split($$0,v,".")}END{printf("%d.%d.%d",v[1],v[2],v[3]+1)}')

DOCKER ?= docker
DOCKER_REGISTRY ?= registry.nutmeg.co.uk:8443
DOCKER_IMAGE_NAME = nutmeg/nginx-file-browser
DOCKER_IMAGE_TAG ?= $(subst /,-,$(NEW_GIT_TAG))
DOCKER_ARTEFACT=$(DOCKER_REGISTRY)/$(DOCKER_IMAGE_NAME):$(DOCKER_IMAGE_TAG)


DOCKER_BUILD_ARGS ?=
VERSION ?= ${LATEST_GIT_TAG}

.SILENT: print-next-release-version print-current-release-version
.PHONY: build

build:
	@echo ">> building $(DOCKER_ARTEFACT) container"
	docker build -t ${DOCKER_ARTEFACT} .

test:
	@echo ">> Testing $(DOCKER_ARTEFACT) container"
	@echo "Tests are included on the image build"

push:
	@echo ">> Publishing $(DOCKER_ARTEFACT) container"
	$(DOCKER) push $(DOCKER_ARTEFACT)

print-next-release-version:
	echo $(NEW_GIT_TAG)

print-current-release-version:
	echo $(LATEST_GIT_TAG)
