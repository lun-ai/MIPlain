#!/usr/bin/php
<?php
$partid = $_POST[participantid];
$fp = fopen('data/results_'.$partid. '.txt', 'a');

fwrite($fp, $_POST[postrecord].PHP_EOL);
fwrite($fp, PHP_EOL);
fwrite($fp, $_POST[gender].PHP_EOL);
fwrite($fp, PHP_EOL);
fwrite($fp, $_POST[age].PHP_EOL);
fwrite($fp, PHP_EOL);
fwrite($fp, $_POST[degree].PHP_EOL);
fclose($fp);
echo "You have now completed the survey! Your completion code is {$partid} ";

?>
