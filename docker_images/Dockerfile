# Start from Amazon Linux 2
FROM amazonlinux:2

# Install required libraries
RUN yum update -y
RUN yum groupinstall -y "Development Tools" -y
RUN yum install openssl-devel libffi-devel bzip2-devel wget -y
RUN cd /opt && \
    wget https://www.python.org/ftp/python/3.10.2/Python-3.10.2.tgz && \
    tar xzf Python-3.10.2.tgz && \
    cd Python-3.10.2 && \
    ./configure --enable-optimizations && \
    make -j $(nproc) && \
    make altinstall && \
    rm -f /opt/Python-3.10.2.tgz


# Install pip
RUN yum install python3-pip -y

RUN yum -y install gcc-c++ make

# Install nodejs
# RUN curl -sL https://rpm.nodesource.com/setup_16.x | bash -
RUN curl -fsSL https://nodejs.org/dist/v16.15.0/node-v16.15.0-linux-x64.tar.xz | tar -xJ -C /usr/local --strip-components=1


RUN npm i -g yarn @nestjs/cli

RUN node --version

