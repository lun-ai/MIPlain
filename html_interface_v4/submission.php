
#!/usr/bin/php
<?php
$partid = $_POST[participantid];
$fp = fopen('data/results_'.$partid. '.txt', 'w');
fwrite($fp, $partid);
fwrite($fp, PHP_EOL);
fwrite($fp, $_POST[postrecord]);
fwrite($fp, PHP_EOL);
fwrite($fp, $_POST[age]);
fwrite($fp, PHP_EOL);
fwrite($fp, $_POST[degree]);
fwrite($fp, PHP_EOL);
fwrite($fp, $_POST[gender]);
fclose($fp);
?>
<p>yo l haricot</p>

    <div align="center">
        <scan style="color:red;font-size:3vw">Well done, you are now a Noughts and Crosses wizard!</scan>
        <scan style="color:red;font-size:3vw">Raise your hand to let the instructor know that you have finished!</scan>
    </div>
</body>
</html>
