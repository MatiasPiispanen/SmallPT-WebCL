#
# smallptGPU & smallptCPU Makefile
#

#ATISTREAMSDKROOT=/home/david/src/ati-stream-sdk-v2.0-lnx64
ATISTREAMSDKROOT=/opt/AMDAPP
CC=gcc
CCFLAGS=-O3 -msse2 -mfpmath=sse -ftree-vectorize -funroll-loops -Wall \
	-I$(ATISTREAMSDKROOT)/include -L$(ATISTREAMSDKROOT)/lib/x86 -lglut -lOpenCL -lm
# Jens's patch for MacOS, comment the 2 lines above and un-comment the lines below
#CCFLAGS=-O3 -ftree-vectorize -msse -msse2 -msse3 -mssse3 -fvariable-expansion-in-unroller \
#	-cl-fast-relaxed-math -cl-mad-enable -Wall -framework OpenCL -framework OpenGl -framework Glut

default: all

all: Makefile smallptCPU smallptGPU preprocessed_kernels

smallptCPU: smallptCPU.c displayfunc.c Makefile vec.h camera.h geom.h displayfunc.h simplernd.h scene.h geomfunc.h
	$(CC) -DSMALLPT_CPU -o smallptCPU smallptCPU.c displayfunc.c $(CCFLAGS)

smallptGPU: smallptGPU.c displayfunc.c Makefile vec.h camera.h geom.h displayfunc.h simplernd.h scene.h geomfunc.h
	$(CC) -DSMALLPT_GPU -o smallptGPU smallptGPU.c displayfunc.c $(CCFLAGS)

clean:
	rm -rf smallptCPU smallptGPU image.ppm SmallptGPU-v1.6 smallptgpu-v1.6.tgz preprocessed_rendering_kernel.cl

preprocessed_kernels:
	cpp <rendering_kernel.cl >preprocessed_rendering_kernel.cl
	cpp <rendering_kernel_dl.cl >preprocessed_rendering_kernel_dl.cl

tgz: clean all
	mkdir SmallptGPU-v1.6
	cp -r smallptCPU smallptGPU scenes LICENSE.txt Makefile README.txt \
		*.pl \
		*.c \
		*.h \
		*.cl \
		*.bat \
		SmallptGPU.exe glut32.dll SmallptGPU-v1.6
	tar zcvf smallptgpu-v1.6.tgz SmallptGPU-v1.6
	rm -rf SmallptGPU-v1.6
