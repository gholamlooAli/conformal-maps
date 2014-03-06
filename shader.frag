// yuv42201_laplace.frag
//
// convert from YUV422 to RGB
//
// This code is in the public domain. If it breaks, you get
// to keep both pieces.



// current_texture_image - the texture that has the video image
//   initialized by the CPU program to contain the number of the 
//   texture unit that contains the video texture.
//   the data indicated by this is assumed to be in the form of
//   a luminance/alpha texture (two components per pixel). in the
//   shader we extract those components from each pixel and turn
//   them into RGB to draw the picture.

// texture_width - the width of the base texture for the window
//   (that is, not the size of the window or the size of the image
//   being textured onto it; but that power-of-two size texture width.)

// texel_width - the width of a texel in texture coordinates. 
//   the texture coordinates in the shader go from 0 to 1.0.
//   so each texel is (1.0 / texture_width) wide.

// texture_height - the height of the base texture for the window
//   (that is, not the size of the window or the size of the image
//   being textured onto it; but that power-of-two size texture height.)

// image_height - the height of the image being put onto the texture.
//   for instance texture_height might be 512 (a power of two) and 
//   image height might be 480.

// shader_on - a 1/0 flag for whether or not to use the YUV->RGB
//   translation code. if this is zero, fragment gets the
//   regular opengl color. 

// color_output - a 1/0 flag; if non-zero generate output in color.
// if zero, generate greyscale

uniform float texture_height;
//uniform float image_height;
uniform sampler2D image_texture_unit;
uniform float texel_width;
uniform float texture_width;
uniform int shader_on;
//uniform int even_scanlines_first;
uniform int color_output; // 0 , 1


// image_processing - if this is 0, the image is unaltered.
//   otherwise, laplacian edge detection is run

uniform int image_processing; // 0, 1

uniform vec2 luma_texcoord_offsets[9];

uniform vec2 chroma_texcoord_offsets[9];

#define IMAGE_WIDTH 640.0
#define IMAGE_HEIGHT 480.0

void main()
{
  float red, green, blue;
  vec4 luma_chroma;
  float luma, chroma_u,  chroma_v;
  float pixelx, pixely;
  float xcoord, ycoord;
  float x, y;
  float u, v;
  vec3 yuv;

  if (shader_on == 0) {
    gl_FragColor = gl_Color;
    return;
  }
  
  // note: pixelx, pixely are 0.0 to 1.0 so "next pixel horizontally"
  //  is not just pixelx + 1; rather pixelx + texel_width.

  pixelx = gl_TexCoord[0].x;
  pixely = gl_TexCoord[0].y;

  x = pixelx - (IMAGE_WIDTH * 0.5) / texture_width;
  y = pixely - (IMAGE_HEIGHT * 0.5) / texture_height;

  u = x*x - y*y;
  v = 2.0*x*y;

  u = u + (IMAGE_WIDTH * 0.5) / texture_width;
  v = v + (IMAGE_HEIGHT * 0.5) / texture_height;
  
  pixelx = clamp(u, 0.0, (IMAGE_WIDTH - 1.0) / texture_width);
  pixely = clamp(v, 0.0, (IMAGE_HEIGHT - 1.0) / texture_height);
  
  // if pixelx is even, then that pixel contains [Y U] and the 
  //    next one contains [Y V] -- and we want the V part.
  // if  pixelx is odd then that pixel contains [Y V] and the 
  //     previous one contains  [Y U] -- and we want the U part.
  
  // note: only valid for images whose width is an even number of
  // pixels
  
  xcoord = floor (pixelx * texture_width);
  
  luma_chroma = texture2D(image_texture_unit, vec2(pixelx, pixely));
  
  // just look up the brightness
  luma = (luma_chroma.r - 0.0625) * 1.1643;
  
  if (0.0 == mod(xcoord , 2.0)) // even
    {
      chroma_u = luma_chroma.a;
      chroma_v = texture2D(image_texture_unit, 
			   vec2(pixelx + texel_width, pixely)).a;
    }
  else // odd
    {
      chroma_v = luma_chroma.a;
      chroma_u = texture2D(image_texture_unit, 
			   vec2(pixelx - texel_width, pixely)).a;     
    }
  chroma_u = chroma_u - 0.5;
  chroma_v = chroma_v - 0.5;
  
  red = luma + 1.5958 * chroma_v;
  green = luma - 0.39173 * chroma_u - 0.81290 * chroma_v;
  blue = luma + 2.017 * chroma_u;
  
  gl_FragColor = vec4(red, green, blue, 1.0);
  //gl_FragColor = vec4(pixelx, pixely, 0.01*(red+ green+ blue), 1.0);

}
