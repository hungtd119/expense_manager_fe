pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    skipDefaultCheckout(true)
    buildDiscarder(logRotator(numToKeepStr: '10'))
  }

  environment {
    APP_NAME = 'expense-manager-frontend'
    FRONTEND_DIR = '.'
    DOCKER_REGISTRY = 'docker.io'
    DOCKER_REPOSITORY = 'hungtd1192002/expanse_manager_fe'
    DOCKER_CREDENTIALS_ID = 'docker-registry-credentials'
    SSH_CREDENTIALS_ID = 'aws-ec2-ssh-key'
    DEPLOY_HOST = '172.31.13.233'
    CONTAINER_NAME = 'expense-manager-frontend'
    HOST_PORT = '8081'
    CONTAINER_PORT = '80'
  }

  stages {
    stage('Checkout source') {
      steps {
        checkout scm
      }
    }

    stage('Prepare') {
      steps {
        script {
          env.FRONTEND_DIR = fileExists('frontend/package.json') ? 'frontend' : '.'
        }
      }
    }

    stage('Install dependencies') {
      steps {
        dir(env.FRONTEND_DIR) {
          sh 'npm ci'
        }
      }
    }

    stage('Quality checks') {
      steps {
        dir(env.FRONTEND_DIR) {
          sh '''
            if npm run | grep -qE '^  lint$'; then
              npm run lint
            else
              echo "No lint script found, skipping."
            fi

            if npm run | grep -qE '^  test$'; then
              npm test -- --watch=false
            else
              echo "No test script found, skipping."
            fi
          '''
        }
      }
    }

    stage('Build frontend') {
      steps {
        dir(env.FRONTEND_DIR) {
          sh 'npm run build'
        }
      }
    }

    stage('Build Docker image') {
      when {
        expression {
          return fileExists("${env.FRONTEND_DIR}/Dockerfile")
        }
      }
      steps {
        dir(env.FRONTEND_DIR) {
          sh '''
            IMAGE="$DOCKER_REGISTRY/$DOCKER_REPOSITORY:$BUILD_NUMBER"
            IMAGE_LATEST="$DOCKER_REGISTRY/$DOCKER_REPOSITORY:latest"

            docker build \
              -t "$IMAGE" \
              -t "$IMAGE_LATEST" \
              .
          '''
        }
      }
    }

    stage('Push Docker image') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: env.DOCKER_CREDENTIALS_ID,
          usernameVariable: 'DOCKER_USERNAME',
          passwordVariable: 'DOCKER_PASSWORD'
        )]) {
          sh '''
            IMAGE="$DOCKER_REGISTRY/$DOCKER_REPOSITORY:$BUILD_NUMBER"
            IMAGE_LATEST="$DOCKER_REGISTRY/$DOCKER_REPOSITORY:latest"

            echo "$DOCKER_PASSWORD" | docker login "$DOCKER_REGISTRY" -u "$DOCKER_USERNAME" --password-stdin
            docker push "$IMAGE"
            docker push "$IMAGE_LATEST"
            docker logout "$DOCKER_REGISTRY"
          '''
        }
      }
    }

    stage('Deploy to AWS instance') {
      steps {
        withCredentials([
          usernamePassword(
            credentialsId: env.DOCKER_CREDENTIALS_ID,
            usernameVariable: 'DOCKER_USERNAME',
            passwordVariable: 'DOCKER_PASSWORD'
          ),
          sshUserPrivateKey(
            credentialsId: env.SSH_CREDENTIALS_ID,
            keyFileVariable: 'SSH_KEY',
            usernameVariable: 'SSH_USER'
          )
        ]) {
          sh '''
            IMAGE="$DOCKER_REGISTRY/$DOCKER_REPOSITORY:$BUILD_NUMBER"

            printf '%s' "$DOCKER_PASSWORD" | ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$DEPLOY_HOST" "docker login '$DOCKER_REGISTRY' -u '$DOCKER_USERNAME' --password-stdin"

            ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$DEPLOY_HOST" "
              set -e
              docker pull '$IMAGE'
              docker stop '$CONTAINER_NAME' || true
              docker rm '$CONTAINER_NAME' || true
              docker run -d \
                --name '$CONTAINER_NAME' \
                --restart unless-stopped \
                -p '$HOST_PORT':'$CONTAINER_PORT' \
                '$IMAGE'
              docker image prune -f
              docker logout '$DOCKER_REGISTRY'
            "
          '''
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: "${env.FRONTEND_DIR}/dist/**", allowEmptyArchive: true
    }
    success {
      echo "Frontend build completed: ${APP_NAME}"
    }
    failure {
      echo "Frontend build failed: ${APP_NAME}"
    }
  }
}
