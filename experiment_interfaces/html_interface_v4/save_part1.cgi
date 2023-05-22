#!/usr/bin/php
<?php
$partid = $_POST[participantid];
$fp = fopen('data/results_'.$partid. '.txt', 'w');
fwrite($fp, $partid.PHP_EOL);
fwrite($fp, PHP_EOL);
fwrite($fp, $_POST[postrecord].PHP_EOL);
fwrite($fp, PHP_EOL);
fwrite($fp, $_POST[gender].PHP_EOL);
fwrite($fp, PHP_EOL);
fwrite($fp, $_POST[age].PHP_EOL);
fwrite($fp, PHP_EOL);
fwrite($fp, $_POST[degree].PHP_EOL);
fclose($fp);
include("pairs.html");

?>
