# Deploying ProTrack to Kubernetes

This guide explains how to deploy the ProTrack application to a Kubernetes cluster.

## Prerequisites

- Kubernetes cluster set up and configured
- `kubectl` CLI tool installed and configured to access your cluster
- Docker installed for building the application image
- Container registry access (Docker Hub, GCR, ECR, etc.)

## Deployment Steps

### 1. Build and Push the Docker Image

```bash
# Build the Docker image
docker build -t your-registry/protrack-app:latest .

# Push the image to your container registry
docker push your-registry/protrack-app:latest
```

### 2. Update the Kubernetes Manifest

Open the `k8s-manifests.yaml` file and update the following fields:

- Update the `image` field in the app deployment to point to your container registry:
  ```yaml
  image: your-registry/protrack-app:latest
  ```
- Update the Ingress host if needed:
  ```yaml
  host: protrack.yourdomain.com
  ```

### 3. Apply the Kubernetes Manifests

```bash
kubectl apply -f k8s-manifests.yaml
```

### 4. Verify the Deployment

```bash
# Check the status of pods
kubectl get pods

# Check the status of services
kubectl get services

# Check the status of ingress
kubectl get ingress
```

### 5. Access the Application

Once the Ingress is properly configured and your DNS settings are updated, you can access the application at:

```
https://protrack.yourdomain.com
```

## Configuration

### Environment Variables

The following environment variables are configured in the Kubernetes manifests:

- `NODE_ENV`: Set to "production" in the ConfigMap
- `DATABASE_URL`: Connection string to the PostgreSQL database

### Database Credentials

Database credentials are stored in a Kubernetes Secret:

- Username: postgres
- Password: postgres
- Database name: protrack

**Note:** For production environments, you should use more secure credentials and consider using a managed database service instead of running PostgreSQL in your cluster.

### Volume Management

PostgreSQL data is stored in a Persistent Volume Claim (PVC) to ensure data persistence across pod restarts.

## Troubleshooting

### Common Issues

1. **Pods not starting:**

   ```bash
   kubectl describe pod <pod-name>
   ```

2. **Database connection issues:**

   - Verify the database service is running:
     ```bash
     kubectl get svc protrack-db
     ```
   - Check database pod logs:
     ```bash
     kubectl logs <postgres-pod-name>
     ```

3. **Application errors:**
   ```bash
   kubectl logs <app-pod-name>
   ```

## Scaling

To scale the application horizontally:

```bash
kubectl scale deployment protrack-app --replicas=3
```

## Updating the Application

When you pull updates from git, you need to rebuild and redeploy the Docker image to incorporate the changes.

### Update Workflow

1. **Pull the latest changes:**

```bash
git pull origin main
```

2. **Rebuild and push the Docker image:**

```bash
# Build the new image with a new tag (recommended to use version tags)
docker build -t your-registry/protrack-app:v1.2.0 .

# Or update the latest tag
docker build -t your-registry/protrack-app:latest .

# Push the updated image
docker push your-registry/protrack-app:v1.2.0
# or
docker push your-registry/protrack-app:latest
```

3. **Update the Kubernetes deployment:**

If using versioned tags:

```bash
# Update the deployment to use the new image version
kubectl set image deployment/protrack-app protrack-app=your-registry/protrack-app:v1.2.0
```

If using the latest tag:

```bash
# Force a rollout to pull the updated 'latest' image
kubectl rollout restart deployment/protrack-app
```

4. **Monitor the deployment:**

```bash
# Watch the rollout status
kubectl rollout status deployment/protrack-app

# Verify pods are running with the new image
kubectl get pods -l app=protrack-app
```

### Best Practices for Updates

- **Use versioned tags** instead of `latest` for better version control
- **Test images locally** before pushing to the registry
- **Monitor rollout status** to ensure successful deployment
- **Keep rollback capability** by maintaining previous image versions

### Rollback if Needed

If the update causes issues, you can rollback to the previous version:

```bash
# Rollback to the previous deployment
kubectl rollout undo deployment/protrack-app

# Or rollback to a specific revision
kubectl rollout undo deployment/protrack-app --to-revision=1
```

### Automated CI/CD Alternative

For production environments, consider setting up automated CI/CD pipelines that:

1. Build and test the application
2. Build and push Docker images with version tags
3. Update Kubernetes deployments automatically
4. Run health checks and rollback if needed
