package java.io;

import static javaemul.internal.InternalPreconditions.checkArgument;

/**
 * Reads characters from a string.
 */
public class StringReader extends Reader {
  private final String text;
  private int position;
  private int mark;

  /**
   * Constructs a reader which will read from the given string.
   */
  public StringReader(String text) {
    this.text = text;
  }

  @Override
  public void close() { }

  /**
   * Reads up to the specified number of characters from the string.
   */
  @Override
  public int read(char[] buf, int off, int readLength) {
    if (position >= text.length()) {
      return -1;
    }
    int length = Math.min(text.length() - position, readLength);
    text.getChars(position, position + length, buf, off);
    position += length;
    return length;
  }

  @Override
  public boolean markSupported() {
    return true;
  }

  @Override
  public void mark(int readAheadLimit) throws IOException {
    checkArgument(readAheadLimit >= 0);
    mark = position;
  }

  @Override
  public void reset() throws IOException {
    position = mark;
  }
}