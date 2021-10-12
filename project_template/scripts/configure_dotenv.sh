SCRIPT_PATH=$(realpath "$0")
SCRIPT_DIRECTORY_PATH=$(dirname "$SCRIPT_PATH")
PROJECT_ROOT_PATH=$(dirname "$SCRIPT_DIRECTORY_PATH")
PACKAGES_PATH="$PROJECT_ROOT_PATH/packages"

DAPI_PATH="${PACKAGES_PATH}"/dapi
SDK_PATH="${PACKAGES_PATH}"/js-dash-sdk
DASHMTAE_PATH="${PACKAGES_PATH}"/dashmate
DASHMATE_BIN=${DASHMTAE_PATH}/bin/dashmate
# DAPI:
cp "${DAPI_PATH}"/.env.example "${DAPI_PATH}"/.env

# JS-SDK:

FAUCET_ADDRESS=$(grep -m 1 "Address:" "${PACKAGES_PATH}"/dashmate/mint.log | awk '{printf $3}')
FAUCET_PRIVATE_KEY=$(grep -m 1 "Private key:" "${PACKAGES_PATH}"/dashmate/mint.log | awk '{printf $4}')
DPNS_CONTRACT_ID=$($DASHMATE_BIN config:get --config="${CONFIG}_1" platform.dpns.contract.id)

SDK_ENV_FILE_PATH=${SDK_PATH}/.env
rm "${SDK_ENV_FILE_PATH}"
touch "${SDK_ENV_FILE_PATH}"

#cat << 'EOF' >> ${SDK_ENV_FILE_PATH}
echo "DAPI_SEED=127.0.0.1
FAUCET_ADDRESS=${FAUCET_ADDRESS}
FAUCET_PRIVATE_KEY=${FAUCET_PRIVATE_KEY}
DPNS_CONTRACT_ID=${DPNS_CONTRACT_ID}" >> "${SDK_ENV_FILE_PATH}"
#EOF
