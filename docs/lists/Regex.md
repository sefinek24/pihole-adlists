[//]: # (Canonical: /docs/lists/Regex.md)

## 📋 Main regular expressions:
```regexp
^ad([sxv]?[0-9]*|system)[_.-]([^.[:space:]]+\.){1,}|[_.-]ad([sxv]?[0-9]*|system)[_.-]
^(.+[_.-])?adse?rv(er?|ice)?s?[0-9]*[_.-]
^(.+[_.-])?telemetry[_.-]
^adim(age|g)s?[0-9]*[_.-]
^adtrack(er|ing)?[0-9]*[_.-]
^advert(s|is(ing|ements?))?[0-9]*[_.-]
^aff(iliat(es?|ion))?[_.-]
^analytics?[_.-]
^banners?[_.-]
^beacons?[0-9]*[_.-]
^mads\.
^pixels?[-.]
```

## 🤔 Explanation
<div align="center">
    <img src="../../images/regex/1.png" alt="1">
    <img src="../../images/regex/2.png" alt="2">
    <img src="../../images/regex/3.png" alt="3">
    <img src="../../images/regex/4.png" alt="4">
    <img src="../../images/regex/5.png" alt="5">
    <img src="../../images/regex/6.png" alt="6">
    <img src="../../images/regex/7.png" alt="7"><br>
    <img src="../../images/regex/8.png" alt="8"><br>
    <img src="../../images/regex/9.png" alt="9"><br>
    <img src="../../images/regex/10.png" alt="10"><br>
    <img src="../../images/regex/11.png" alt="11"><br>
    <img src="../../images/regex/12.png" alt="12">
</div>

## 🗑️ Removed regular expressions
1. `^count(ers?)?[0-9]*[_.-]` - This expression has been removed because it was blocking access to [counter-strike.net](https://www.counter-strike.net).
2. `^stat(s|istics)?[0-9]*[_.-]` - It is blocking access to [stats.uptimerobot.com](https://stats.uptimerobot.com).

## 🔠 Source
https://github.com/mmotti/pihole-regex/blob/master/regex.list


<h3 align="right">
    <a href="https://extendsclass.com/regex-tester.html">Online Regex tester and visualizer »</a>
</h3>
