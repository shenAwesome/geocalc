package test;

import java.util.Set;

import com.google.gwt.core.ext.LinkerContext;
import com.google.gwt.core.ext.TreeLogger;
import com.google.gwt.core.ext.UnableToCompleteException;
import com.google.gwt.core.ext.linker.AbstractLinker;
import com.google.gwt.core.ext.linker.ArtifactSet;
import com.google.gwt.core.ext.linker.CompilationResult;
import com.google.gwt.core.ext.linker.LinkerOrder;
import com.google.gwt.core.ext.linker.LinkerOrder.Order;
import com.google.gwt.dev.About;
import com.google.gwt.dev.util.DefaultTextOutput;

/*
 * Derived from GwtNodeLinker
 *
 * https://github.com/cretz/gwt-node/blob/master/src/org/gwtnode/dev/linker/GwtNodeLinker.java
 * delight.gwt.simplelinker.SimpleLinker.java
 *
 * Copyright 2011 Chad Retz
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * Simple linker to remove a lot of GWT fluff
 *
 * Also see
 * https://github.com/thatcher/env-js/blob/master/htmlparser/gwt2/src/com/envjs/
 * gwt/linker/ServerSingleScriptLinker.java
 *
 * @author Chad Retz
 */
@LinkerOrder(Order.PRIMARY)
public class SimpleLinker extends AbstractLinker {

    @Override
    public String getDescription() {
        return "SimpleLinker";
    }

    @Override
    public ArtifactSet link(final TreeLogger logger, final LinkerContext context, final ArtifactSet artifacts)
            throws UnableToCompleteException {
        final ArtifactSet toReturn = new ArtifactSet(artifacts);
        final DefaultTextOutput out = new DefaultTextOutput(true);

        // out.print("var $stats = function() { };");
        out.print("var $_window = this;");
        out.newline();
        out.print("var $gwt_version = \"" + About.getGwtVersionNum() + "\";");
        out.newline();
        out.print("var $stats = $wnd.__gwtStatsEvent ? function(a) {$wnd.__gwtStatsEvent(a)} : null;");
        out.newline();
        out.print("var $sessionId = function() { };");
        out.newline();

        final Set<CompilationResult> results = artifacts.find(CompilationResult.class);
        CompilationResult result = null;
        if (results.size() > 1) {
            logger.log(TreeLogger.ERROR, "The module must have exactly one distinct" + " permutation when using the "
                    + getDescription() + " Linker.", null);
            throw new UnableToCompleteException();
        } else if (!results.isEmpty()) {
            result = results.iterator().next();
            // dump JS
            final String[] js = result.getJavaScript();
            if (js.length != 1) {
                logger.log(TreeLogger.ERROR,
                        "The module must not have multiple fragments when using the " + getDescription() + " Linker.",
                        null);
                throw new UnableToCompleteException();
            }
            out.print(js[0]);
            out.newline();
        }

        addPreloadCode(logger, context, artifacts, result, out);
        out.newline();
        out.print("gwtOnLoad(null, '" + context.getModuleName() + "', null);");
        out.newline();
        // out.print("})();");
        // out.newline();
        // and to string
        toReturn.add(emitString(logger, out.toString(), context.getModuleName() + ".js"));
        return toReturn;
    }

    protected void addPreloadCode(final TreeLogger logger, final LinkerContext context, final ArtifactSet artifacts,
                                  final CompilationResult result, final DefaultTextOutput out) throws UnableToCompleteException {
        // noop
    }

}