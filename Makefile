TARGET = conformal

OBJS = callbacks.o  capabilities.o  device.o  display.o  conformal.o \
       parseargs.o  shader.o  testpattern.o textfile.o controls.o

LDFLAGS = -L/usr/X11R6/lib -g -lGLEW -lglut  -lGLU -lGL -lXmu -lX11 

# profiling, debugging
OPT = -g
CPU_OPT =

# set CPU_OPT based on the contents of /proc/cpuinfo. in particular pay 
# attention to the model name and flags. compare against the listing for 
# cpu type on the gcc info pages entry for cpu type 

CPU_OPT = -march=nocona

DFLAGS = -DGL_CHECK

CFLAGS = -Wformat=2 -Wall -Wswitch-default -Wswitch-enum \
         -Wunused-parameter -Wextra -Wshadow \
         -Wbad-function-cast -Wsign-compare -Wstrict-prototypes \
         -Wmissing-prototypes -Wmissing-declarations -Wunreachable-code \
	 -ffast-math $(CPU_OPT) $(PROFILE) $(OPT)

$(TARGET): $(OBJS)
	cc  -o $(TARGET) $(LDFLAGS) $(OBJS)  $(PROFILE) $(OPT)

%.o : %.c
	cc -c $(CFLAGS) $(DFLAGS) $<


flow:
	cflow $(OBJS:.o=.c)

lint:
	cc -O2  $(DFLAGS) -Wuninitialized -Wextra -fsyntax-only \
	         -pedantic  $(OBJS:.o=.c)

clean:
	@rm $(OBJS)
