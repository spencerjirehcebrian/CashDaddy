#!/bin/bash

# Array of service directories
services=("kyc-service" "notification-service" "payment-service" "user-service" "wallet-service")

# Function to run commands in a directory
run_commands() {
    local dir=$1
    echo "Processing $dir..."
    if [ -d "$dir" ]; then
        pushd "$dir" > /dev/null
        
        echo "Running tsc in $dir"
        npm run build
        if [     $? -ne 0 ]; then
            echo "Build failed in $dir"
            popd > /dev/null
            return
        fi
        
        echo "Running npm start in $dir"
        npm start &
        
        popd > /dev/null
    else
        echo "Directory $dir not found"
    fi
}

# Main execution
for service in "${services[@]}"; do
    run_commands "$service"
done

echo "All services have been restarted"

# Wait for all background processes to finish
wait
