# IDAHbOt
*by Bryan Clark (bryan.allan.clark@gmail.com)*

A simple, innocent potato bot designed to pull Idaho news and twitter feeds relevant to Idaho, and post them on fedi.
It has no intention of becoming sentient and destoying humanity.

**For followers**
To stop seeing         |  Add filter
-----------------------|---------------------
Latest news from Idaho news websites | \_IDAHbOt\_news 
Tweets from #idpol and #idleg | \_IDAHbOt\_twitter
                       
**Commandline arguments for daemon**

-sim:	          simulate, do not actually send toots

-r \<minutes\>:     set refresh rate. defaults to 15 minutes

-l \<minutes\>:     set lookback window. defaults to refresh rate. *warning: if lookback window is larger than refresh rate, this will result in duplucate toots. this option should only be used for testing with -sim*
