/* ***** BEGIN LICENSE BLOCK *****
    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA

    The Original Code is the Headercolumns Extension.

    The Initial Developer of the Original Code is Rene Ejury.
    Portions created by the Initial Developer are Copyright (C) 2011
    the Initial Developer. All Rights Reserved.

    Contributor(s):
 * ***** END LICENSE BLOCK ***** */

var EXPORTED_SYMBOLS = ["setupLogging", "dumpCallStack", "logRoot", "Colors"]

Components.utils.import("resource:///modules/gloda/log4moz.js");

function setupLogging(name) {
  let Log = Log4Moz.repository.getLogger(name);

  Log.assert = function (aBool, aStr) {
    if (!aBool) {
      this.error("\n!!!!!!!!!!!!!!!!!!!!!!"+
                 "\n    ASSERT FAILURE    "+
                 "\n!!!!!!!!!!!!!!!!!!!!!!\n"+aStr);
      dumpCallStack();
      throw Error("Assert failures are fatal, man");
    }
  };

  return Log;
}

let Prefs = Components.classes["@mozilla.org/preferences-service;1"]
  .getService(Components.interfaces.nsIPrefService)
  .getBranch("extensions.headercolumns.");

function setupFullLogging(name) {
  // dump(name+"\n\n");
  // The basic formatter will output lines like:
  // DATE/TIME	LoggerName	LEVEL	(log message) 
  let formatter = new Log4Moz.BasicFormatter();

  let Log = Log4Moz.repository.getLogger(name);

  // Loggers are hierarchical, lowering this log level will affect all output
  let root = Log;
  root.level = Log4Moz.Level["All"];

  if (Prefs.getBoolPref("logging_enabled")) {
    // A console appender outputs to the JS Error Console
    let capp = new Log4Moz.ConsoleAppender(formatter);
    capp.level = Log4Moz.Level["Warn"];
    root.addAppender(capp);

    // A dump appender outputs to standard out
    let dapp = new Log4Moz.DumpAppender(formatter);
    dapp.level = Log4Moz.Level["All"];
    root.addAppender(dapp);
  }

  Log.assert = function (aBool, aStr) {
    if (!aBool) {
      this.error("\n!!!!!!!!!!!!!!!!!!!!!!"+
                 "\n    ASSERT FAILURE    "+
                 "\n!!!!!!!!!!!!!!!!!!!!!!\n"+aStr);
      throw Error("Assert failures are fatal, man");
    }
  };

  Log.debug("Logging enabled");

  return Log;
}

// Must call this once to setup the root logger
let logRoot = "headercolumns";
let MyLog = setupFullLogging(logRoot);

function dumpCallStack(e) {
  let frame = e ? e.stack : Components.stack;
  while (frame) {
    MyLog.debug("\n"+frame);
    frame = frame.caller;
  }
};

let Colors = {
  yellow: "\u001b[01;33m",
  blue: "\u001b[01;36m",
  red: "\u001b[01;31m",
  default: "\u001b[00m",
};
