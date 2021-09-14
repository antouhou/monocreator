full_path=$(realpath $0)
dir_path=$(dirname $full_path)
root_path=$(dirname $dir_path)
packages_path="$root_path/packages"
tmp="$root_path/tmp"
dashmate="$root_path/packages/dashmate/bin/dashmate"

CONFIG="local"

DPNS_CONTRACT_ID=$($dashmate config:get --config="${CONFIG}_1" platform.dpns.contract.id)
DPNS_CONTRACT_BLOCK_HEIGHT=$($dashmate config:get --config="${CONFIG}_1" platform.dpns.contract.blockHeight)
DPNS_TOP_LEVEL_IDENTITY_ID=$($dashmate config:get --config="${CONFIG}_1" platform.dpns.ownerId)
DPNS_TOP_LEVEL_IDENTITY_PRIVATE_KEY=$(grep -m 1 "HD private key:" ${root_path}/setup.log | awk '{$1=""; printf $5}')

echo $DAPI_BUILD_PATH

echo "Local network is configured:"

echo "DPNS_CONTRACT_ID: ${DPNS_CONTRACT_ID}"
echo "DPNS_CONTRACT_BLOCK_HEIGHT: ${DPNS_CONTRACT_BLOCK_HEIGHT}"
echo "DPNS_TOP_LEVEL_IDENTITY_ID: ${DPNS_TOP_LEVEL_IDENTITY_ID}"
echo "DPNS_TOP_LEVEL_IDENTITY_PRIVATE_KEY: ${DPNS_TOP_LEVEL_IDENTITY_PRIVATE_KEY}"

echo "Mint 100 Dash to faucet address"

$dashmate wallet:mint --verbose --config=local_seed 100 | tee ${root_path}/mint.log

FAUCET_ADDRESS=$(grep -m 1 "Address:" mint.log | awk '{printf $3}')
FAUCET_PRIVATE_KEY=$(grep -m 1 "Private key:" mint.log | awk '{printf $4}')

echo "FAUCET_ADDRESS: ${FAUCET_ADDRESS}"
echo "FAUCET_PRIVATE_KEY: ${FAUCET_PRIVATE_KEY}"

TEST_ENV_FILE_PATH=${packages_path}/platform-test-suite/.env
rm ${TEST_ENV_FILE_PATH}
touch ${TEST_ENV_FILE_PATH}

#cat << 'EOF' >> ${TEST_ENV_FILE_PATH}
echo "DAPI_SEED=127.0.0.1
FAUCET_ADDRESS=${FAUCET_ADDRESS}
FAUCET_PRIVATE_KEY=${FAUCET_PRIVATE_KEY}
DPNS_CONTRACT_ID=${DPNS_CONTRACT_ID}
DPNS_CONTRACT_BLOCK_HEIGHT=${DPNS_CONTRACT_BLOCK_HEIGHT}
DPNS_TOP_LEVEL_IDENTITY_ID=${DPNS_TOP_LEVEL_IDENTITY_ID}
DPNS_TOP_LEVEL_IDENTITY_PRIVATE_KEY=${DPNS_TOP_LEVEL_IDENTITY_PRIVATE_KEY}
NETWORK=regtest" >> ${TEST_ENV_FILE_PATH}
#EOF

echo "Platform test suite is configured. The config is written to ${TEST_ENV_FILE_PATH}"