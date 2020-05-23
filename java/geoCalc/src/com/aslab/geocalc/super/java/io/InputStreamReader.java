package java.io;

import java.io.IOException;

/**
 * Emulation of the {@link java.io.InputStreamReader} class for the GWT edition.
 *
 * @author Jerome Louvel
 */
public class InputStreamReader extends Reader {

  /** The next position to read. */
  private int position;

  /** The text to read. */
  private final String text;

  /**
   * Constructor.
   *
   * @param stream
   * The source text to read.
   */
  public InputStreamReader(InputStream stream) {
    this(stream.getText());
  }

  /**
   * Constructor.
   *
   * @param stream
   * The source text to read.
   * @param charsetName
   * The name of a supported charset.
   */
  public InputStreamReader(InputStream stream, String charsetName) {
    this(stream.getText());
  }

  /**
   * Constructor.
   *
   * @param text
   * The source text to read.
   */
  public InputStreamReader(String text) {
    this.text = text;
    this.position = 0;
  }

  @Override
  public void close() throws IOException {

  }

  /**
   * Reads the next character in the source text.
   *
   * @return The next character or -1 if end of text is reached.
   */
  @Override
  public int read() throws IOException {
    return (this.position == this.text.length()) ? -1 : this.text
            .charAt(this.position++);
  }

  @Override
  public int read(char[] cbuf, int off, int len) throws IOException {
    if (position >= text.length())
      return -1;
    int n = Math.min(text.length() - position, len);
    text.getChars(position, position + n, cbuf, off);
    position += n;
    return n;
  }

}